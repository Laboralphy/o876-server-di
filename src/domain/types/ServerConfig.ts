import z from 'zod';

export const ServerConfigOptionsSchema = z
    .object({
        loginNewUser: z.string(),
        mailMaxExpirationDays: z.number().int(),
        mailMaxKeptMessages: z.number().int(),
        mailMaxMessageLength: z.number().int(),
        mailMaxTopicLength: z.number().int(),
        mailMaxMessagePreviewLength: z.number().int(),
        name: z.string(),
        version: z.string(),
        author: z.string(),
        license: z.string(),
        description: z.string(),
    })
    .strict();

export type ServerConfigOptions = z.infer<typeof ServerConfigOptionsSchema>;
