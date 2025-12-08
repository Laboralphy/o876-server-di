import {
    DatabaseInitOptions,
    ForEachCallback,
    IDatabaseAdapter,
} from '../../domain/ports/adapters/IDatabaseAdapter';
import path from 'node:path';
import {
    Collection,
    DiskStorage,
    MemoryStorage,
    IndexCreationOptions,
    IStorage,
} from 'o876-json-db';
import { JsonObject, ScalarValue } from '../../domain/types/JsonStruct';
import { debug } from '../../libs/o876-debug';
import { expandPath } from '../../libs/expand-path';
import { Cradle } from '../../boot/container';
import { JsonDatabaseStructure } from '../../boot/json-database-structure';

const debugDb = debug('srv:database');

export class JsonDatabase implements IDatabaseAdapter {
    private collections: Map<string, Collection<JsonObject>> = new Map();
    private diskStorage = new DiskStorage();
    private memoryStorage = new MemoryStorage();
    private structure: JsonDatabaseStructure;

    constructor({ jsonDatabaseStructure }: Cradle) {
        this.structure = jsonDatabaseStructure;
    }

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

    private getCollection<T extends JsonObject>(name: string): Collection<T> {
        const oCollection = this.collections.get(name);
        if (oCollection) {
            return oCollection as Collection<T>;
        } else {
            throw new ReferenceError(`Could not get collection "${name}"`);
        }
    }

    async init(options: DatabaseInitOptions): Promise<void> {
        debugDb('json-database - building structure / index');
        // Users
        for (const { name, storage, indexes } of this.structure.collections) {
            await this.initCollection(
                name,
                storage == 'memory' ? this.memoryStorage : this.diskStorage,
                options,
                indexes
            );
        }
        debugDb('json-database structure initialized');
    }

    async find<T extends JsonObject>(table: string, query: JsonObject): Promise<T[]> {
        const collection: Collection<T> = this.getCollection(table);
        const cursor = await collection.find(query);
        return cursor.fetchAll();
    }

    async load<T extends JsonObject>(table: string, key: string): Promise<T | undefined> {
        return this.getCollection<T>(table).load(key);
    }

    async remove(table: string, key: string): Promise<void> {
        return this.getCollection(table).delete(key);
    }

    async store<T extends JsonObject>(table: string, key: string, data: T): Promise<void> {
        return this.getCollection<T>(table).save(key, data);
    }

    async forEach<T extends JsonObject>(
        table: string,
        callback: ForEachCallback<T>
    ): Promise<void> {
        await this.getCollection<T>(table).filter((data, key: string) => {
            callback(data, key);
            return false;
        });
    }
}
