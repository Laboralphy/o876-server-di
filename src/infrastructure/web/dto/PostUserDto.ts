import z from 'zod';
import { String1k } from '../../../domain/schemas/String1k';

export const PostUserDtoSchema = z
    .object({
        name: String1k,
        password: String1k,
        email: z.email(),
        displayName: String1k,
    })
    .strict();

export type PostUserDto = z.infer<typeof PostUserDtoSchema>;
