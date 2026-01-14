import z from 'zod';

/**
 * GMCP Server -> Client
 * Stop playing media files.
 * And play or display the media.
 * An empty body will stop all media.
 */
export const ClientMediaStopSchema = z.object({
    name: z.string(), // Name of the media file. May contain directory information (i.e. weather/lightning.mp3).
    type: z.enum(['music', 'sound', 'image']), // Identifies the type of media.
    tag: z.string().optional(), // Helps categorize media.
    fadeaway: z.boolean(), //if true
    fadeout: z.number().int().positive().optional(),
    priority: z.number().min(1).max(100).optional(),
    key: z.string().optional(), // Stops playing media by key matching the value specified.
});

export type ClientMediaStop = z.infer<typeof ClientMediaStopSchema>;
