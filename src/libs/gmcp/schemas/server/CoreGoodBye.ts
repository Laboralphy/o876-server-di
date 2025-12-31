import z from 'zod';

/**
 * GMCP Server -> Client
 * This simple GMCP structure is sent to a departing client
 * It gives a reason why the user is being disconnected.
 */
export const CoreGoodByeSchema = z.string();

export type CoreGoodBye = z.infer<typeof CoreGoodByeSchema>;
