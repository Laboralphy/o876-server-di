import z from 'zod';

/**
 * GMCP Server -> Client
 * It symbolized a message post by a user to public channel.
 * channel : channel identifier
 * talker : name of user posting the message
 * text : content of post message
 */
export const CommChannelTextSchema = z
    .object({
        channel: z.string(),
        talker: z.string(),
        text: z.string(),
    })
    .strict();

export type CommChannelText = z.infer<typeof CommChannelTextSchema>;
