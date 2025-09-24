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
import { JsonObject, ScalarValue } from '../../domain/types';

export class JsonDatabase implements IDatabaseAdapter {
    private collections: Map<string, Collection> = new Map<string, Collection>();
    private diskStorage = new DiskStorage();
    private memoryStorage = new MemoryStorage();

    async initCollection(
        name: string,
        storage: IStorage,
        options: InitOptions,
        indexOptions: { [indexName: string]: IndexCreationOptions }
    ) {
        const collection = new Collection(path.resolve(options.host, 'data', name), indexOptions);
        collection.storage = storage;
        this.collections.set(name, collection);
        await collection.init();
    }

    getCollection(name: string): Collection {
        const oCollection = this.collections.get(name);
        if (oCollection) {
            return oCollection;
        } else {
            throw new Error(`Could not get collection "${name}"`);
        }
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

    async find(table: string, query: { [p: string]: ScalarValue }): Promise<JsonObject[]> {
        const cursor = await this.getCollection(table).find(query);
        return cursor.fetchAll();
    }

    async load(table: string, key: string): Promise<JsonObject | undefined> {
        return this.getCollection(table).load(key);
    }

    async remove(table: string, key: string): Promise<void> {
        return this.getCollection(table).remove(key);
    }

    async store(table: string, key: string, data: JsonObject): Promise<void> {
        return this.getCollection(table).save(key, data);
    }
}
