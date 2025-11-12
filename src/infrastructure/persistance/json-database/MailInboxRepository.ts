import { Cradle } from '../../../boot/container';
import { ForEachCallback, IDatabaseAdapter } from '../../../domain/ports/adapters/IDatabaseAdapter';
import { IMailInboxRepository } from '../../../domain/ports/repositories/IMailInboxRepository';
import { MailInbox, MailInboxSchema } from '../../../domain/entities/MailInbox';

const COLLECTION_NAME = 'mail-inboxes';

export class MailInboxRepository implements IMailInboxRepository {
    private readonly database: IDatabaseAdapter;

    constructor({ database }: Cradle) {
        this.database = database;
    }

    async save(mib: MailInbox): Promise<MailInbox> {
        await this.database.store(COLLECTION_NAME, mib.userId + '-' + mib.messageId, mib);
        return mib;
    }

    async delete(mib: MailInbox): Promise<void> {
        return this.database.remove(COLLECTION_NAME, mib.userId + '-' + mib.messageId);
    }

    async get(id: string): Promise<MailInbox | undefined> {
        const data = await this.database.load(COLLECTION_NAME, id);
        if (data) {
            return MailInboxSchema.parse(data);
        } else {
            return undefined;
        }
    }

    async forEach(callback: ForEachCallback<MailInbox>): Promise<void> {
        await this.database.forEach(COLLECTION_NAME, callback);
    }

    findByUserId(userId: string): Promise<MailInbox[]> {
        return this.database.find<MailInbox>(COLLECTION_NAME, { userId });
    }
}
