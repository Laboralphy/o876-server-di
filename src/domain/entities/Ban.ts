import z from 'zod';
import { EntityId } from '../schemas/EntityId';

export const BanSchema = z.object({
    tsBegin: z.number(),
    tsEnd: z.number(),
    forever: z.boolean(),
    reason: z.string(),
    bannedBy: EntityId.nullable(),
});

export type Ban = z.infer<typeof BanSchema>;
