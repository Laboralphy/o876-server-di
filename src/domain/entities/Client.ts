import z from 'zod';
import { EntityId } from '../schemas/EntityId';

export enum CLIENT_STAGES {
    NOT_CONNECTED, // not connected
    LOGIN, // connected and expected to send login part of credentials
    AUTHENTICATED, // connected and fully authenticated
    DESTROYING, // is going to be destroyed very soon
    DESTROYED, // has been destroyed, must be removed from in memory registry
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
