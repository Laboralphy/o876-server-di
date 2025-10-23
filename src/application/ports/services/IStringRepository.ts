import { JsonObject } from '../../../domain/types/JsonStruct';

/**
 * This class is aimed at retrieving a string asset, with its key, and some optional parameters.
 */
export interface IStringRepository {
    init(): Promise<void>;
    setLanguage(language: string): Promise<void>;
    defineStrings(data: JsonObject, lng: string): void;
    render(key: string, parameters?: JsonObject): string;
}
