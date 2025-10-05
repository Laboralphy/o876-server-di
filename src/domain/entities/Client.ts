import z from 'zod';

export const ClientSchema = z.object({
    id: z.string(),
    login: z.string().nullable(),
    password: z.string().nullable(),
});

export type Client = z.infer<typeof ClientSchema>;
