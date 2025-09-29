import z from 'zod';

export const PatchUserDtoSchema = z.object({
    password: z.string().optional(),
    email: z.email().optional(),
});

export type PatchUserDto = z.infer<typeof PatchUserDtoSchema>;
