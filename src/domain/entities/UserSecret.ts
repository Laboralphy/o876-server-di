import z from 'zod';
import { EntityId } from '../schemas/EntityId';

export const UserSecretSchema = z.object({
    id: EntityId,
    password: z.string(),
});

export type UserSecret = z.infer<typeof UserSecretSchema>;
