import z from 'zod';
import { ROLES } from '../../domain/enums/roles';
import { DisplayName } from '../../domain/schemas/DisplayName';
import { EmailString } from '../../domain/schemas/EmailString';

export const ModifyUserDtoSchema = z
    .object({
        email: EmailString.optional(),
        displayName: DisplayName.optional(),
        roles: z.array(z.enum(ROLES)).optional(),
    })
    .strict();

export type ModifyUserDto = z.infer<typeof ModifyUserDtoSchema>;
