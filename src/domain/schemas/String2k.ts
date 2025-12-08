import z from 'zod';

export const String2k = z.string().max(2048);
