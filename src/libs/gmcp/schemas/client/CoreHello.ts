import z from 'zod';

/**
 * GMCP Client -> Server
 * This GMCP Structure is sent by client to server.
 * The client may describe itself with this structure.
 */
export const CoreHelloSchema = z
    .object({
        client: z.string(),
        version: z.string(),
    })
    .strict();

export type CoreHello = z.infer<typeof CoreHelloSchema>;
