import z from 'zod';
import { Roles } from '../enums';
import { EntityId } from '../schemas/EntityId';
import { BanSchema } from './Ban';

export const UserSchema = z.object({
    id: EntityId,
    name: z.string(),
    email: z.email(),
    tsCreation: z.number(),
    tsLastUsed: z.number(),
    roles: z.array(z.enum(Roles)),
    ban: BanSchema.nullable(),
});

export type User = z.infer<typeof UserSchema>;
