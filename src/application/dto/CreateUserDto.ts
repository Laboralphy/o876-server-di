import z from 'zod';

export const CreateUserDtoSchema = z
    .object({
        name: z.string(),
        password: z.string(),
        email: z.email(),
        displayName: z.string(),
    })
    .strict();

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
