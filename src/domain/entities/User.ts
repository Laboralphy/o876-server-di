import z from 'zod';
import { ROLES } from '../enums/roles';
import { EntityId } from '../schemas/EntityId';
import { BanSchema } from './Ban';

export const UserSchema = z
    .object({
        id: EntityId,
        name: z.string(),
        displayName: z.string(),
        email: z.email(),
        tsCreation: z.number(),
        tsLastUsed: z.number(),
        roles: z.array(z.enum(ROLES)),
        ban: BanSchema.nullable(),
    })
    .strict();

export type User = z.infer<typeof UserSchema>;
