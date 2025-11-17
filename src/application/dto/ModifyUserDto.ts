import z from 'zod';
import { String1k } from '../../domain/schemas/String1k';
import { ROLES } from '../../domain/enums/roles';

export const ModifyUserDtoSchema = z
    .object({
        email: z.email().max(1024).optional(),
        displayName: String1k.optional(),
        roles: z.array(z.enum(ROLES)).optional(),
    })
    .strict();

export type ModifyUserDto = z.infer<typeof ModifyUserDtoSchema>;
