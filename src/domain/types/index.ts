import z from 'zod';

export const NumericKey = z.number().int().positive();
export const EntityId = z.string();

export type ScalarValue = number | string | boolean | null;

export type JsonValue = ScalarValue | JsonObject | JsonArray;

export interface JsonObject {
    [key: string]: JsonValue;
}

export type JsonArray = Array<JsonValue>;
