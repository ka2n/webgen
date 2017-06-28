import { Renderer } from '.'
import { BuildResult } from '../builder'

import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'

import * as helpers from './helper'

export class FileRenderer implements Renderer {
    public Exec(input: BuildResult[], output_dir: string): boolean {
        input.forEach(r => {
            const base = path.resolve(process.cwd(), output_dir)
            const local_path = path.join(base, r.local_path)
            const dir = path.dirname(local_path)

            mkdirp.sync(dir)
            fs.writeFileSync(local_path, r.tmpl(helpers))

            console.log(`Created ${r.local_path}`)
        })
        return true
    }
}