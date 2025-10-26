import {
    DatabaseInitOptions,
    ForEachCallback,
    IDatabaseAdapter,
} from '../../domain/ports/adapters/IDatabaseAdapter';
import path from 'node:path';
import {
    Collection,
    DiskStorage,
    IndexCreationOptions,
    IStorage,
    MemoryStorage,
} from 'o876-json-db';
import { JsonObject, ScalarValue } from '../../domain/types/JsonStruct';
import { debug } from '../../libs/o876-debug';
import { expandPath } from '../../libs/expand-path';
import { JsonDatabaseConfig } from '../../boot/json-database.config';

const debugDb = debug('srv:database');

export class JsonDatabase implements IDatabaseAdapter {
    private collections: Map<string, Collection> = new Map<string, Collection>();
    private diskStorage = new DiskStorage();
    private memoryStorage = new MemoryStorage();

    async initCollection(
        name: string,
        storage: IStorage,
        options: DatabaseInitOptions,
        indexOptions: { [indexName: string]: IndexCreationOptions }
    ) {
        const sCollectionLocation = path.join(expandPath(options.host), name);
        debugDb('initializing collection "%s" at location : %s', name, sCollectionLocation);
        const collection = new Collection(sCollectionLocation, indexOptions);
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

    async init(options: DatabaseInitOptions): Promise<void> {
        debugDb('json-database management system : json json-database');
        // Users
        for (const { name, indexes } of JsonDatabaseConfig.collections) {
            await this.initCollection(name, this.diskStorage, options, indexes);
        }
        debugDb('json-database initialization complete');
    }

    async find(table: string, query: { [p: string]: ScalarValue }): Promise<JsonObject[]> {
        const collection = this.getCollection(table);
        const cursor = await collection.find(query);
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

    async forEach<T>(table: string, callback: ForEachCallback<T>): Promise<void> {
        await this.getCollection(table).filter((data: JsonObject, key: string) => {
            callback(data as T, key);
            return false;
        });
    }
}
