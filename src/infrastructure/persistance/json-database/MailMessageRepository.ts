import { Cradle } from '../../../boot/container';
import { ForEachCallback, IDatabaseAdapter } from '../../../domain/ports/adapters/IDatabaseAdapter';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { MailMessage, MailMessageSchema } from '../../../domain/entities/MailMessage';

const COLLECTION_NAME = 'mail-messages';

export class MailMessageRepository implements IMailMessageRepository {
    private readonly database: IDatabaseAdapter;

    constructor({ database }: Cradle) {
        this.database = database;
    }

    async save(message: MailMessage): Promise<MailMessage> {
        await this.database.store(COLLECTION_NAME, message.id, message);
        return message;
    }

    async delete(message: MailMessage): Promise<void> {
        return this.database.remove(COLLECTION_NAME, message.id);
    }

    async get(id: string): Promise<MailMessage | undefined> {
        const data = await this.database.load(COLLECTION_NAME, id);
        if (data) {
            return MailMessageSchema.parse(data);
        } else {
            return undefined;
        }
    }

    async forEach(callback: ForEachCallback<MailMessage>): Promise<void> {
        await this.database.forEach(COLLECTION_NAME, callback);
    }

    async findUserMessages(userId: string): Promise<MailMessage[]> {
        return this.database.find(COLLECTION_NAME, { recipientId: userId });
    }

    async findExpiredMessages(ts: number): Promise<MailMessage[]> {
        return this.database.find<MailMessage>(COLLECTION_NAME, {
            tsSent: { $lte: ts },
        });
    }
}
