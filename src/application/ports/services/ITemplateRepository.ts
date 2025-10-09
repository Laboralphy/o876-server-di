import { JsonObject } from '../../../domain/types/JsonStruct';

/**
 * This class is aimed at retrieving a string asset, with its key, and some optional parameters.
 */
export interface ITemplateRepository {
    init(location: string): Promise<void>;
    render(key: string, parameters?: JsonObject): string | undefined;
    loadTemplates(sLocation: string): Promise<void>;
}
