import z from 'zod';

export const PutUserPasswordDtoSchema = z.object({
    password: z.string(),
});

export type PutUserPasswordDto = z.infer<typeof PutUserPasswordDtoSchema>;
