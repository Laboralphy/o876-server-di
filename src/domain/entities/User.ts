import z from 'zod';
import { Role } from '../enums/Role';
import { NumericKey } from '../types';
import { BanSchema } from './Ban';

export const UserSchema = z.object({
    id: NumericKey,
    name: z.string(),
    password: z.string(),
    email: z.string(),
    dateCreation: z.date(),
    dateLastUsed: z.date(),
    roles: z.array(z.enum(Role)),
    ban: BanSchema.nullable(),
});

export type User = z.infer<typeof UserSchema>;
