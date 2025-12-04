import z from 'zod';

export const String1k = z.string().max(1024);
