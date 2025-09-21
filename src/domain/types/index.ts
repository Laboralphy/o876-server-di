import z from 'zod';

export const NumericKey = z.number().int().positive();
export const EntityId = z.string();
