import z from 'zod';
import { String1k } from '../../domain/schemas/String1k';

export const CreateUserDtoSchema = z
    .object({
        name: String1k,
        password: String1k,
        email: z.email().max(1024),
        displayName: String1k,
    })
    .strict();

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
