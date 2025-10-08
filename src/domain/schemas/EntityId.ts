import z from 'zod';

export const EntityId = z.string().regex(/^[a-z0-9]+$/);
