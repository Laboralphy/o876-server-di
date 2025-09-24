import { JsonObject, ScalarValue } from '../types';

export type InitOptions = {
    host: string;
    user: string;
    password: string;
};

export interface IDatabaseAdapter {
    /**
     * Database initialization process.
     * Make connection, create schema, if first connection....
     */
    init(options: InitOptions): Promise<void>;

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
}
