import z from 'zod';
import { EntityId } from '../types';

export enum CLIENT_STAGES {
    NOT_CONNECTED,
    LOGIN,
    PASSWORD,
    CONNECTED,
}

export const ClientSchema = z.object({
    id: EntityId,
    login: z.string().nullable(),
    stage: z.enum(CLIENT_STAGES),
    user: EntityId,
});

export type Client = z.infer<typeof ClientSchema>;
