import { IRepository } from './IRepository';
import { MailMessage } from '../../entities/MailMessage';

export type IMailMessageRepository = IRepository<MailMessage>;
