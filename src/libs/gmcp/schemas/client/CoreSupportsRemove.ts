import z from 'zod';
import { SUPPORTS_REGEX } from './CoreSupportsSet';

export const CoreSupportsRemoveSchema = z.array(z.string().regex(SUPPORTS_REGEX));

export type CoreSupportsRemove = z.infer<typeof CoreSupportsRemoveSchema>;
