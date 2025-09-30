import z from 'zod';
import { EntityId } from '../../../domain/types';

const BanSchema = z.object({
    reason: z.string(),
    bannedBy: z.string(),
    duration: z.string(),
});

export const GetUserInfoDtoSchema = z.object({
    id: EntityId,
    name: z.string(),
    email: z.string(),
    since: z.string(),
    connected: z.boolean(),
    ban: BanSchema.nullable(),
});

export type GetUserInfoDto = z.infer<typeof GetUserInfoDtoSchema>;
