/**
 * This class is aimed at retrieving a string asset, with its key, and some optional parameters.
 */
export interface IStringRepository {
    getString(key: string, parameters: Record<string, string | number>): string;
}
