import { JsonObject } from '../../../domain/types/JsonStruct';

/**
 * This class is aimed at retrieving a string asset, with its key, and some optional parameters.
 */
export interface ITemplateRepository {
    init(): void;
    render(key: string, parameters?: JsonObject): string | undefined;
    defineTemplate(key: string, templateContent: string): void;
}
