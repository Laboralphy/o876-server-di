import { IRepository } from './IRepository';
import { MailInbox } from '../../entities/MailInbox';

export interface IMailInboxRepository extends IRepository<MailInbox> {
    findByUserId(userId: string): Promise<MailInbox[]>;
}
