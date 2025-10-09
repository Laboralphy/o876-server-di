/**
 * This class is aimed at retrieving a string asset, with its key, and some optional parameters.
 */
export interface IStringRepository {
    init(): Promise<void>;
    setLanguage(language: string): Promise<void>;
    loadFolder(path: string): Promise<void>;
    render(key: string, parameters: Record<string, string | number>): string;
}
