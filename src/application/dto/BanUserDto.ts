import z from 'zod';

export const BanUserDtoSchema = z.object({
    bannedBy: z.string(),
    duration: z.string(),
    reason: z.string(),
});

export type BanUserDto = z.infer<typeof BanUserDtoSchema>;
