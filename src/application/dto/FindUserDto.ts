import z from 'zod';
import { String1k } from '../../domain/schemas/String1k';

export const FindUserDtoSchema = z
    .object({
        name: String1k.optional(),
        displayName: String1k.optional(),
    })
    .strict();

export type FindUserDto = z.infer<typeof FindUserDtoSchema>;
