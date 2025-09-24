import { IDatabaseAdapter, InitOptions } from '../../domain/ports/IDatabaseAdapter';
import path from 'node:path';
import {
    Collection,
    IStorage,
    IndexCreationOptions,
    MemoryStorage,
    DiskStorage,
    INDEX_TYPES,
} from 'o876-json-db';

export class JsonDatabase implements IDatabaseAdapter {
    private collections: Map<string, Collection> = new Map<string, Collection>();
    private diskStorage = new DiskStorage();
    private memoryStorage = new MemoryStorage();

    async initCollection(
        name: string,
        storage: IStorage,
        options: InitOptions,
        indexOptions: IndexCreationOptions
    ) {
        const collection = new Collection(path.resolve(options.host, name), indexOptions);
        collection.storage = storage;
        this.collections.set(name, collection);
        await userCollection.init();
    }

    async init(options: InitOptions): Promise<void> {
        // Users
        await this.initCollection('users', this.diskStorage, options, {
            name: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: true,
            },
        });
    }

    getCollection(name: string): Collection {
        if (!this.collections.has(name)) {
            throw new Error(`Could not get collection "${name}"`);
        }
        return this.collections.get(name);
    }

    async find(table: string, query: { [p: string]: ScalarValue }): Promise<JsonObject[]> {
        return this.getCollection(table).find(query);
    }

    async load(table: string, key: string): Promise<JsonObject> {
        return this.getCollection(table).load(key);
    }

    async remove(table: string, key: string): Promise<void> {
        return this.getCollection(table).remove(key);
    }

    async store(table: string, key: string, data: JsonObject): Promise<void> {
        return this.getCollection(table).store(key, data);
    }
}
