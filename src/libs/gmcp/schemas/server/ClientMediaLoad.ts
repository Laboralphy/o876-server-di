import z from 'zod';

/**
 * GMCP Server -> Client
 * The client receiving this packet must download the specified media.
 * if url is not specified, use the url given by Client.Media.Default
 */
export const ClientMediaLoadSchema = z.object({
    name: z.string(), // name of the media file May contain directory information (i.e. weather/lightning.mp3).
    url: z.string().optional(),
});

export type ClientMediaLoad = z.infer<typeof ClientMediaLoadSchema>;
