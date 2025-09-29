import z from 'zod';
import { EntityId } from '../types';

export const BanSchema = z.object({
    tsBegin: z.number(),
    tsEnd: z.number(),
    forever: z.boolean(),
    reason: z.string(),
    bannedBy: EntityId,
});

export type Ban = z.infer<typeof BanSchema>;
