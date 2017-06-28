import * as commander from 'commander';
import * as path from 'path';

import { Config } from '../cli/config'

import { createClient } from '../resource';
import { Builder } from '../builder';
import { FileRenderer } from '../renderer/file-renderer'

export class Build {

    private program: commander.CommanderStatic;
    private package: any;
    private app: Builder

    constructor() {
        this.program = commander;
        this.package = require('../../package.json');
    }

    public async initialize() {
        this.program
            .version(this.package.version)
            .option('-c,--config [path]', "configuration file")
            .option('-a,--auth [value]', 'Content Delivery API - access token')
            .option('-s,--space [value]', 'Space ID')
            .option('-t,--template [dir]', 'template files dir')
            .option('-o,--output [dir]', 'output directory')
            .parse(process.argv);

        if (this.program.config == null) {
            this.program.help();
            return
        }

        let cnf = Config.fromPath(this.program.config)

        if (this.program.auth != null) cnf.resouceConf.accessToken = this.program.auth
        if (this.program.space != null) cnf.resouceConf.space = this.program.space
        if (this.program.template != null) cnf.builderConf.TemplateDir = this.program.template
        if (this.program.output != null) cnf.outputDir = this.program.output

        const builder = new Builder(createClient(cnf.resouceConf));

        builder.build(cnf.builderConf).then(ret => {
            const renderer = new FileRenderer()
            renderer.Exec(ret, cnf.outputDir)
        }).catch((e: any) => {
            console.error(e)
        })
    }
}

let app = new Build();
app.initialize();