import z from 'zod';
import { EntityId } from '../../../domain/types';

export const GetUserInfoOutputSchema = z.object({
    id: EntityId,
    name: z.string(),
    email: z.string(),
    ban: {
        forever: z.boolean(),
        reason: z.string(),
        bannedBy: z.string(),
        until: z.number(),
        duration: z.string(),
    },
});

export type GetUserInfoOutput = z.infer<typeof GetUserInfoOutputSchema>;
