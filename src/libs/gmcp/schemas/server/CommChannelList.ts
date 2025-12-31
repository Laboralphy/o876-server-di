import z from 'zod';

/**
 * GMCP Server -> Client
 * This GMCP structure will be to clients asking for a list of chat channels
 * It describes the list of available channel to users.
 * Each item in this array is :
 * name : name of the channel
 * command : command used to write on this channel
 * enabled : true if this channel is enabled for the user
 */
export const CommChannelListSchema = z.array(
    z
        .object({
            name: z.string(),
            command: z.string().optional(),
            enabled: z.boolean(),
        })
        .strict()
);

export type CommChannelList = z.infer<typeof CommChannelListSchema>;
