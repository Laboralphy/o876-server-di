import {
    DatabaseInitOptions,
    ForEachCallback,
    IDatabaseAdapter,
} from '../../domain/ports/IDatabaseAdapter';
import path from 'node:path';
import {
    Collection,
    DiskStorage,
    INDEX_TYPES,
    IndexCreationOptions,
    IStorage,
    MemoryStorage,
} from 'o876-json-db';
import { JsonObject, ScalarValue } from '../../domain/types';
import { printDbg } from '../../libs/print-dbg';
import { expandPath } from '../../libs/expand-path';

const debugDb = printDbg('database');

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
        await this.initCollection('users', this.diskStorage, options, {
            name: {
                type: INDEX_TYPES.HASH,
                caseInsensitive: true,
            },
            ban: {
                type: INDEX_TYPES.TRUTHY,
                nullable: true,
            },
        });
        await this.initCollection('user-secrets', this.diskStorage, options, {});
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
