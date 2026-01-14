import z from 'zod';

/**
 * GMCP Server -> Client
 * Send to the client, the default path to static resources.
 */
export const ClientMediaDefaultSchema = z.object({
    url: z.string(),
});

export type ClientMediaDefault = z.infer<typeof ClientMediaDefaultSchema>;
