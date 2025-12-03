import z from 'zod';
import { String1k } from '../../domain/schemas/String1k';
import { EmailString } from '../../domain/schemas/EmailString';

export const CreateUserDtoSchema = z
    .object({
        name: String1k,
        password: String1k,
        email: EmailString,
        displayName: String1k,
    })
    .strict();

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
