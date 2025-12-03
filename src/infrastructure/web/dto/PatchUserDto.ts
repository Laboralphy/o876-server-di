import z from 'zod';
import { String1k } from '../../../domain/schemas/String1k';
import { ROLES } from '../../../domain/enums/roles';
import { EmailString } from '../../../domain/schemas/EmailString';

export const PatchUserDtoSchema = z
    .object({
        email: EmailString.optional(),
        displayName: String1k.optional(),
        roles: z.array(z.enum(ROLES)).optional(),
    })
    .strict();

export type PatchUserDto = z.infer<typeof PatchUserDtoSchema>;
