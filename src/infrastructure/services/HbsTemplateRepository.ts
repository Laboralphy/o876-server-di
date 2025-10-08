import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';
import { JsonValue } from '../../domain/types/JsonStruct';
import { getTemplate } from '../../libs/template-loader';

export class HbsTemplateRepository implements ITemplateRepository {
    renderTemplate(key: string, parameters: Record<string, JsonValue>): string | undefined {
        const template = getTemplate(key);
        if (template) {
            return template(parameters);
        } else {
            return undefined;
        }
    }
}
