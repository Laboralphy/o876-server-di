import z from 'zod';
import { EntityId } from '../schemas/EntityId';

export const MailInboxSchema = z.object({
    messageId: EntityId,
    tag: z.number(),
    userId: EntityId,
    tsReceived: z.number(),
    deleted: z.boolean(),
    pinned: z.boolean(),
    read: z.boolean(),
});

export type MailInbox = z.infer<typeof MailInboxSchema>;
