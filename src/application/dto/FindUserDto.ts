import z from 'zod';

export const FindUserDtoSchema = z
    .object({
        name: z.string().optional(),
        displayName: z.string().optional(),
    })
    .strict();

export type FindUserDto = z.infer<typeof FindUserDtoSchema>;
