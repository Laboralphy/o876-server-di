import z from 'zod';

export const ServerConfigOptionsSchema = z
    .object({
        loginNewUser: z.string(),
        mailMaxExpirationDays: z.number().int(),
        mailMaxKeptMessages: z.number().int(),
        mailMaxMessageLength: z.number().int(),
        mailMaxMessagePreviewLength: z.number().int(),
    })
    .strict();

export type ServerConfigOptions = z.infer<typeof ServerConfigOptionsSchema>;
