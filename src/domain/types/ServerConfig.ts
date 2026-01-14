import z from 'zod';

export const ServerConfigOptionsSchema = z
    .object({
        name: z.string(),
        version: z.string(),
        author: z.string(),
        license: z.string(),
        description: z.string(),
        language: z.enum(['en', 'fr']),
        loginNewUser: z.string(),
        mailMaxExpirationDays: z.number().int(),
        mailMaxMessageLength: z.number().int(),
        modules: z.array(z.string()),
    })
    .strict();

export type ServerConfigOptions = z.infer<typeof ServerConfigOptionsSchema>;
