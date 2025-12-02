import z from 'zod';

export const SetMailFlagsDtoSchema = z
    .object({
        read: z.boolean().optional(),
        deleted: z.boolean().optional(),
        pinned: z.boolean().optional(),
    })
    .strict();

export type SetMailFlagsDto = z.infer<typeof SetMailFlagsDtoSchema>;
