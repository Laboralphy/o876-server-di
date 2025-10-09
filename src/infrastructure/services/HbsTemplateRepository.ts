import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';
import { JsonObject } from '../../domain/types/JsonStruct';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { Cradle } from '../../config/container';
import path from 'node:path';
import { FsHelper } from 'o876-fs-ts';
import handlebars, { HelperOptions } from 'handlebars';
import { printDbg } from '../../libs/print-dbg';

const debugHbs = printDbg('hbs');

export class HbsTemplateRepository implements ITemplateRepository {
    private readonly stringRepository: IStringRepository;
    private readonly registry: Map<string, HandlebarsTemplateDelegate> = new Map();
    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
    }

    async init(location: string): Promise<void> {
        handlebars.registerHelper('t', (key: string, options: HelperOptions) => {
            return this.stringRepository.render(key, { ...options.data.root, ...options.hash });
        });
        await this.loadTemplates(location);
    }

    async loadTemplates(sLocation: string) {
        const sNormLocation = path.normalize(sLocation);
        debugHbs('searching templates at location : %s', sNormLocation);
        const fsh = new FsHelper();
        const aFiles = await fsh.files(sLocation);
        const aProms = aFiles
            .filter((file) => file.endsWith('.hbs'))
            .map(async (file: string) => {
                const sContent = await fsh.read(file);
                const oTemplate = handlebars.compile(sContent, { noEscape: true });
                const key = file.substring(sNormLocation.length + 1, file.length - 4);
                this.registry.set(key, oTemplate);
            });
        await Promise.all(aProms);
        debugHbs('compiled %d template(s)', aProms.length);
    }

    render(key: string, parameters?: JsonObject): string | undefined {
        const template = this.registry.get(key);
        if (template) {
            return template(parameters);
        } else {
            return undefined;
        }
    }
}
