import z from 'zod';

export const PutUserBanDtoSchema = z.object({
    reason: z.string(),
    forever: z.boolean().optional(),
    duration: z
        .object({
            days: z.number().optional(),
            hours: z.number().optional(),
            minutes: z.number().optional(),
        })
        .optional(),
});

export type PutUserBanDto = z.infer<typeof PutUserBanDtoSchema>;
