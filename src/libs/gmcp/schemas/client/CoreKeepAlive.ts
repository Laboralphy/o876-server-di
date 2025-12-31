import z from 'zod';

export const CoreKeepAliveSchema = z.object({}).strict();

export type CoreKeepAlive = z.infer<typeof CoreKeepAliveSchema>;
