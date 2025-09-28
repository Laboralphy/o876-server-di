import z from 'zod';

export const ModifyUserDtoSchema = z.object({
    password: z.string().optional(),
    email: z.email().optional(),
});

export type ModifyUserDto = z.infer<typeof ModifyUserDtoSchema>;
