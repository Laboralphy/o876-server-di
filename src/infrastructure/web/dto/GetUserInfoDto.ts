import z from 'zod';
import { EntityId } from '../../../domain/schemas/EntityId';

const BanSchema = z.object({
    reason: z.string(),
    bannedBy: z.string(),
    since: z.string(),
    until: z.string(),
});

export const GetUserInfoDtoSchema = z.object({
    id: EntityId,
    name: z.string(),
    email: z.string(),
    created: z.string(),
    connected: z.boolean(),
    ban: BanSchema.nullable(),
});

export type GetUserInfoDto = z.infer<typeof GetUserInfoDtoSchema>;
