import z from 'zod';
import { ROLES } from '../../domain/enums/roles';

export const ModifyUserRolesDtoSchema = z.object({
    roles: z.array(z.enum(ROLES)),
});

export type ModifyUserRolesDto = z.infer<typeof ModifyUserRolesDtoSchema>;
