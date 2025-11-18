import z from 'zod';
import { EntityId } from '../schemas/EntityId';
import { String1k } from '../schemas/String1k';

export const UserSecretSchema = z.object({
    id: EntityId,
    password: String1k,
});

export type UserSecret = z.infer<typeof UserSecretSchema>;
