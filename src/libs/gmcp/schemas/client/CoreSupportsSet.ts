import z from 'zod';

export const SUPPORTS_REGEX = /^[.a-z]+(\s+\d+)?$/i;

export const CoreSupportsSetSchema = z.array(z.string().regex(SUPPORTS_REGEX));

export type CoreSupportsSet = z.infer<typeof CoreSupportsSetSchema>;
