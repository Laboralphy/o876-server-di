import z from 'zod';
import { EntityId } from '../types';

export enum CLIENT_STAGES {
    NOT_CONNECTED,
    LOGIN,
    PASSWORD,
    CONNECTED,
}

export enum CLIENT_PROTOCOL {
    NONE,
    TELNET,
    WEBSOCKET,
}

export const ClientSchema = z.object({
    id: EntityId,
    stage: z.enum(CLIENT_STAGES),
    user: EntityId.nullable(),
    protocol: z.enum(CLIENT_PROTOCOL),
});

export type Client = z.infer<typeof ClientSchema>;
