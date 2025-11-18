import z from 'zod';
import { ROLES } from '../enums/roles';
import { EntityId } from '../schemas/EntityId';
import { BanSchema } from './Ban';

export const REGEX_DISPLAYNAME = /^[a-zA-Z](?:[a-zA-Z-]{1,22}[a-zA-Z])?$/;
export const REGEX_USERNAME = /^[-_a-z0-9]{3,24}$/;

export const UserSchema = z
    .object({
        id: EntityId,
        name: z.string().regex(REGEX_USERNAME),
        displayName: z.string().regex(REGEX_DISPLAYNAME),
        email: z.email(),
        tsCreation: z.number(),
        tsLastUsed: z.number(),
        roles: z.array(z.enum(ROLES)),
        ban: BanSchema.nullable(),
    })
    .strict();

export type User = z.infer<typeof UserSchema>;
