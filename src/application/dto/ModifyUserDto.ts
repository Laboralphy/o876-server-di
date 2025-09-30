import z from 'zod';

export const ModifyUserDtoSchema = z.object({
    email: z.email().optional(),
});

export type ModifyUserDto = z.infer<typeof ModifyUserDtoSchema>;
