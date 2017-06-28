import * as fs from 'fs'
import * as path from 'path'

import { Conf as BuilderConf, PostTypeConfMap } from '../builder'
import { Auth as ResourceConf } from '../resource'

// {
//     "resources": {
//         "author": {
//             "url_base": "authors",
//             "slug": "name",
//             "slug_transform": "snakecase",
//             "template": "author2"
//         }
//     },
//     "output_dir": "./out",
//     "template_dir": "./src"
// }
//

export class Config {
    public static fromPath(cnfPath: string): Config {
        const cnfAbsPath = path.resolve(process.cwd(), cnfPath)
        const cnfAbsDir = path.dirname(cnfAbsPath)
        const raw = JSON.parse(fs.readFileSync(cnfAbsPath, 'utf8'))

        let r = <ResourceConf>{}
        if ((typeof raw.contentful !== 'object')) {
            throw new Error("Invalid config: contentful")
        }
        const c = raw.contentful
        const accessToken = c.access_token
        const space = c.space_id
        if (accessToken == null) {
            throw new Error("Invalid config: contentful.access_token")
        }
        r.accessToken = accessToken

        if (space == null) {
            throw new Error("Invalid config: contentful.space")
        }
        r.space = space


        let b: BuilderConf
        if ((typeof raw.resources !== 'object') && raw.resources) {
            throw new Error("Invalid config: resouces")
        }
        b = <BuilderConf>{}
        b.Resources = (raw.resources as PostTypeConfMap) || {}
        b.TemplateDir = path.resolve(cnfAbsDir, raw.template_dir || "view")

        const outputDir = path.resolve(cnfAbsDir, raw.output_dir || "dist")

        return new Config(b, r, outputDir)
    }

    public builderConf: BuilderConf
    public resouceConf: ResourceConf
    public outputDir: string

    constructor(b: BuilderConf, r: ResourceConf, o?: string) {
        this.builderConf = b
        this.resouceConf = r
        this.outputDir = o
    }
}