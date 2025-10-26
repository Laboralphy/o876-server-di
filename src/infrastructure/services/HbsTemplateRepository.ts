import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';
import { JsonObject } from '../../domain/types/JsonStruct';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { Cradle } from '../../boot/container';
import handlebars, { HelperOptions } from 'handlebars';
import {
    fgcolor,
    bgcolor,
    ANSI_RESET_BG,
    ANSI_RESET_FG,
    ANSI_RESET,
} from '../../libs/ansi-256/renderer';

export class HbsTemplateRepository implements ITemplateRepository {
    private readonly stringRepository: IStringRepository;
    private readonly registry: Map<string, HandlebarsTemplateDelegate> = new Map();
    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
    }

    init(): void {
        handlebars.registerHelper('t', (key: string, options: HelperOptions) => {
            return this.stringRepository.render(key, { ...options.data.root, ...options.hash });
        });
        handlebars.registerHelper('color', (fg: string, bg: string | HelperOptions) => {
            const sFG = fg == '' ? ANSI_RESET_FG : fgcolor(fg);
            const sBG = typeof bg === 'string' ? (bg == '' ? ANSI_RESET_BG : bgcolor(bg)) : '';
            return sFG + sBG;
        });
    }

    defineTemplate(key: string, templateContent: string): void {
        const oTemplate = handlebars.compile(templateContent, { noEscape: true });
        this.registry.set(key, oTemplate);
    }

    render(key: string, parameters?: JsonObject): string | undefined {
        const template = this.registry.get(key);
        if (template) {
            return template(parameters) + ANSI_RESET;
        } else {
            return undefined;
        }
    }
}
