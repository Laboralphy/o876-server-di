import z from 'zod';
import { SUPPORTS_REGEX } from './CoreSupportsSet';

export const CoreSupportsAddSchema = z.array(z.string().regex(SUPPORTS_REGEX));

export type CoreSupportsAdd = z.infer<typeof CoreSupportsAddSchema>;
