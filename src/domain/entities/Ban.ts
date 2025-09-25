import z from 'zod';
import { NumericKey } from '../types';

export const BanSchema = z.object({
    id: NumericKey,
    tsBegin: z.number(),
    tsEnd: z.number(),
    forever: z.boolean(),
    reason: z.string(),
    bannedBy: NumericKey,
});

export type Ban = typeof BanSchema;
