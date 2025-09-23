import z from 'zod';

export const CreateUserDtoSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.email(),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
