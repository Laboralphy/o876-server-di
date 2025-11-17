import z from 'zod';
import { String1k } from '../../../domain/schemas/String1k';

export const PutUserBanDtoSchema = z
    .object({
        reason: String1k,
        forever: z.boolean().optional(),
        duration: z
            .object({
                days: z.number().optional(),
                hours: z.number().optional(),
                minutes: z.number().optional(),
            })
            .optional(),
    })
    .strict();

export type PutUserBanDto = z.infer<typeof PutUserBanDtoSchema>;
