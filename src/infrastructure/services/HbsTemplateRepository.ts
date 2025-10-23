import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';
import { JsonObject } from '../../domain/types/JsonStruct';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { Cradle } from '../../config/container';
import handlebars, { HelperOptions } from 'handlebars';

export class HbsTemplateRepository implements ITemplateRepository {
    private readonly stringRepository: IStringRepository;
    private readonly registry: Map<string, HandlebarsTemplateDelegate> = new Map();
    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
    }

    async init(): Promise<void> {
        handlebars.registerHelper('t', (key: string, options: HelperOptions) => {
            return this.stringRepository.render(key, { ...options.data.root, ...options.hash });
        });
    }

    defineTemplate(key: string, templateContent: string): void {
        const oTemplate = handlebars.compile(templateContent, { noEscape: true });
        this.registry.set(key, oTemplate);
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
