import z from 'zod';
import { EntityId } from '../schemas/EntityId';

export const MailMessageSchema = z.object({
    id: EntityId,
    senderId: EntityId,
    recipientIds: z.array(EntityId),
    content: z.string(),
    tsCreation: z.number(),
});

export type MailMessage = z.infer<typeof MailMessageSchema>;
