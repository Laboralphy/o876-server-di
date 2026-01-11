import { JsonObject } from '../../../domain/types/JsonStruct';

export interface IModuleManager {
    getModuleLocation(sModuleName: string): string;
    getLoadedModules(): string[];
    loadModuleFromFolder(location: string): Promise<void>;
    getAsset(name: string): JsonObject;
}
