import z from 'zod';
import { Roles } from '../enums';
import { EntityId } from '../types';
import { BanSchema } from './Ban';

export const UserSchema = z.object({
    id: EntityId,
    name: z.string(),
    password: z.string(),
    email: z.email(),
    dateCreation: z.date(),
    dateLastUsed: z.date(),
    roles: z.array(z.enum(Roles)),
    ban: BanSchema.nullable(),
});

export type User = z.infer<typeof UserSchema>;
