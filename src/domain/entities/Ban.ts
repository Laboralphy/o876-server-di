import z from 'zod';
import { NumericKey } from '../types';

export const BanSchema = z.object({
    id: NumericKey,
    dateBegin: z.date(),
    dateEnd: z.date().nullable(),
    forever: z.boolean(),
    reason: z.string(),
    bannedBy: NumericKey,
});

export type Ban = typeof BanSchema;
