import z from 'zod';

export const PatchUserDtoSchema = z.object({
    email: z.email().optional(),
});

export type PatchUserDto = z.infer<typeof PatchUserDtoSchema>;
