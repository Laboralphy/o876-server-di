import z from 'zod';

export const CreateUserDtoSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
