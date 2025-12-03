import z from 'zod';
import { ROLES } from '../enums/roles';
import { EntityId } from '../schemas/EntityId';
import { BanSchema } from './Ban';
import { DisplayName } from '../schemas/DisplayName';
import { UserName } from '../schemas/UserName';
import { EmailString } from '../schemas/EmailString';

export const UserSchema = z
    .object({
        id: EntityId,
        name: UserName,
        displayName: DisplayName,
        email: EmailString,
        tsCreation: z.number(),
        tsLastUsed: z.number(),
        roles: z.array(z.enum(ROLES)),
        ban: BanSchema.nullable(),
    })
    .strict();

export type User = z.infer<typeof UserSchema>;
