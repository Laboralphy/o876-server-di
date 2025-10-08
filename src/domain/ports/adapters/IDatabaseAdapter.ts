import { JsonObject, ScalarValue } from '../../types/JsonStruct';

export type DatabaseInitOptions = {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
};

export interface ForEachCallback<T> {
    (data: T, key: string): void;
}

export interface IDatabaseAdapter {
    /**
     * Database initialization process.
     * Make connection, create schema, if first connection....
     */
    init(options: DatabaseInitOptions): Promise<void>;

    /**
     * Store a JSON document in the specified table, with the specified key
     * @param table table name
     * @param key json document primary key
     * @param data a plain object
     */
    store(table: string, key: string, data: JsonObject): Promise<void>;

    /**
     * Retrieve data from the specified table with the spécified key by direct access.
     * @param table table name
     * @param key json document primary key
     */
    load(table: string, key: string): Promise<JsonObject | undefined>;

    /**
     * Deletes the specified document
     * @param table
     * @param key
     */
    remove(table: string, key: string): Promise<void>;

    /**
     * Retrieve a list Json documents matching the predicate
     * @param table
     * @param query
     */
    find(table: string, query: { [property: string]: ScalarValue }): Promise<JsonObject[]>;

    /**
     * A general purpose iteration mechanism
     * Iterate through all items of the collection
     * Useful for collection with large amount of items.
     * @param table
     * @param callback
     */
    forEach<T>(table: string, callback: ForEachCallback<T>): Promise<void>;
}
