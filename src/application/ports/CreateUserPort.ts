import z from 'zod';

export const CreateUserPortSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.string(),
});

export type CreateUserPort = z.infer<typeof CreateUserPortSchema>;
