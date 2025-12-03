import z from 'zod';

export const EmailString = z.email().max(256);
