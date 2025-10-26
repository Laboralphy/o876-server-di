import { JsonObject } from '../../../domain/types/JsonStruct';

export interface IModuleManager {
    loadModuleFromFolder(location: string): Promise<void>;
    getAsset(name: string): JsonObject;
}
