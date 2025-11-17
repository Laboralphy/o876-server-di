import z from 'zod';
import { String1k } from '../../../domain/schemas/String1k';

export const PutUserPasswordDtoSchema = z
    .object({
        password: String1k,
    })
    .strict();

export type PutUserPasswordDto = z.infer<typeof PutUserPasswordDtoSchema>;
