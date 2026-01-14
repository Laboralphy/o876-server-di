import z from 'zod';

/**
 * GMCP Server -> Client
 * The client receiving this packet must download the specified media.
 * And play or display the media.
 * if url is not specified, use the url given by Client.Media.Default
 */
export const ClientMediaPlaySchema = z.object({
    name: z.string(), // Name of the media file. May contain directory information (i.e. weather/lightning.mp3).
    url: z.string().optional(), // Resource location where the media file may be downloaded. Last character must be a / (slash).
    // Only required if the file is to be downloaded remotely and a url was not set above with Client.Media.Default or Client.Media.Load.
    type: z.enum(['music', 'sound', 'image']), // Identifies the type of media.
    tag: z.string().optional(), // Helps categorize media.
    volume: z.number().min(1).max(100).optional(), // Relative to the volume set on the player's client.
    fadein: z.number().int().positive().optional(), //
    fadeout: z.number().int().positive().optional(),
    start: z.number().int().positive().optional(),
    finish: z.number().int().positive().optional(),
    loops: z.number().int().optional(),
    priority: z.number().min(1).max(100).optional(),
    continue: z.boolean().optional(),
    key: z.string().optional(), // Uniquely identifies media files with a "key" that is bound to their "name" or "url".
    // Halts the play of current media files with the same "key" that have a different "name" or "url" while this media plays.
    caption: z.string().optional(),
});

export type ClientMediaPlay = z.infer<typeof ClientMediaPlaySchema>;
