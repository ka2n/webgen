import * as Contentful from 'contentful'
import * as _ from 'lodash'
import * as path from 'path'
import * as fs from 'fs'
import * as pug from 'pug'

export interface PostTypeConf {
    url_base?: string
    slug?: string
    slug_transform?: string
    template?: string
}

export type PostTypeConfMap = { [key: string]: PostTypeConf }

export interface Conf {
    TemplateDir: string
    Resources: PostTypeConfMap
}

export interface BuildResult {
    tmpl: (opt?: { [propName: string]: any }) => string
    local_path: string
    remote_path: string
}

export class Builder {

    private client: Contentful.ContentfulClientApi

    constructor(client: Contentful.ContentfulClientApi) {
        this.client = client
    }

    public async build(config: Conf): Promise<BuildResult[]> {
        const client = this.client

        const types = await client.getContentTypes()

        let templateMap: { [key: string]: pug.compileTemplate } = {}

        const entries = Promise.all(types.items.map(async type => {
            const typeName = type.name.toLowerCase()
            const cnf = config.Resources[typeName] || {};

            let templatePaths = [
                typeName
            ]
            if (cnf.template) {
                templatePaths.unshift(cnf.template)
            }

            const url_base = cnf.url_base || _.snakeCase(typeName)

            const entries = await client.getEntries({ 'content_type': type.sys.id })
            return entries.items.map(entry => {
                // URL                
                let slug: string
                slug = cnf.slug && entry.fields[cnf.slug] || entry.fields['slug'] || entry.sys.id

                if (cnf.slug_transform) {
                    if (cnf.slug_transform == "snakecase") {
                        slug = _.snakeCase(slug)
                    }
                }

                const remote_path = path.join(url_base, slug)
                const local_path = remote_path + "/index.html"

                // Templates
                let templates = _.clone(templatePaths)
                if (cnf.template) {
                    const ext = path.extname(cnf.template)
                    const base = path.basename(cnf.template, ext)

                    templates.unshift(base + '_' + slug + ext)
                    templates.unshift(base + '_' + entry.sys.id + ext)
                }
                templates.push(typeName + '_' + slug)
                templates.push(typeName + '_' + entry.sys.id)
                templates = _.uniq(templates)

                templates = templates.map(p => {
                    const ext = path.extname(p)
                    if (ext == '') {
                        p += '.pug'
                    }
                    return path.resolve(config.TemplateDir, p)
                })

                const readableTempls = templates.filter(p => {
                    try {
                        return fs.existsSync(p)
                    } catch (_e) {
                        return false
                    }
                })

                if (readableTempls.length == 0) {
                    throw new Error("template not found: \n search path: \n\t" + templates.join(',\n\t'))
                }

                // Locals                
                const locals = {
                    entry,
                }

                // Compile template                
                let tmplKey = readableTempls[0]
                let tmpl = templateMap[tmplKey]
                if (!tmpl) {
                    tmpl = pug.compileFile(tmplKey, {})
                    templateMap[tmplKey] = tmpl
                }
                return {
                    tmpl: (opt: { [propName: string]: any } = {}) => tmpl({ ...opt, ...locals }),
                    local_path,
                    remote_path,
                }
            })
        }))

        return _.flatten(await entries)
    }
}