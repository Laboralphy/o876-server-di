import { IRepository } from './IRepository';
import { MailMessage } from '../../entities/MailMessage';

export interface IMailMessageRepository extends IRepository<MailMessage> {
    findUserMessages(userId: string): Promise<MailMessage[]>;
}
