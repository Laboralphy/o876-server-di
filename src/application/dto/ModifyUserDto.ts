import z from 'zod';
import { ROLES } from '../../domain/enums/roles';
import { DisplayName } from '../../domain/schemas/DisplayName';

export const ModifyUserDtoSchema = z
    .object({
        email: z.email().max(1024).optional(),
        displayName: DisplayName.optional(),
        roles: z.array(z.enum(ROLES)).optional(),
    })
    .strict();

export type ModifyUserDto = z.infer<typeof ModifyUserDtoSchema>;
