import z from 'zod';

export const PostUserDtoSchema = z.object({
    name: z.string(),
    password: z.string(),
    email: z.email(),
});

export type PostUserDto = z.infer<typeof PostUserDtoSchema>;
