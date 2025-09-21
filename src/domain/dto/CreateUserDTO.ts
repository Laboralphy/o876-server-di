import z from 'zod';

export const CreateUserDTOSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.string(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
