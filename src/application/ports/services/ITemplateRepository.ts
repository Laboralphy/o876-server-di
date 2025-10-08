import { JsonValue } from '../../../domain/types/JsonStruct';

/**
 * This class is aimed at retrieving a string asset, with its key, and some optional parameters.
 */
export interface ITemplateRepository {
    renderTemplate(key: string, parameters: Record<string, JsonValue>): string | undefined;
}
