import z from 'zod';

export const PatchUserDtoSchema = z.object({
    id: z.string(),
    password: z.string().optional(),
    email: z.email().optional(),
});

export type PatchUserDto = z.infer<typeof PatchUserDtoSchema>;
