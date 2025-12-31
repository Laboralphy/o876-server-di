import z from 'zod';

export const CorePingSchema = z
    .object({
        ping: z.number().optional(),
    })
    .strict();

export type CorePing = z.infer<typeof CorePingSchema>;
