import { User } from '../../../domain/entities/User';
import { SendMail } from '../../../application/use-cases/mail/SendMail';
import {
    CheckMailInbox,
    CheckMailInboxEntry,
} from '../../../application/use-cases/mail/CheckMailInbox';
import { ScopedCradle } from '../ApiContextBuilder';
import { AbstractContextService } from './AbstractContextService';

export class MailContextService extends AbstractContextService {
    private readonly sendMail: SendMail;
    private readonly checkMailInbox: CheckMailInbox;

    constructor(cradle: ScopedCradle) {
        super(cradle);
        this.sendMail = cradle.sendMail;
        this.checkMailInbox = cradle.checkMailInbox;
    }

    async sendMessage(recipients: User[], topic: string, message: string): Promise<void> {
        const user = this.user;
        return this.sendMail.execute(
            user.id,
            recipients.map((user) => user.id),
            topic,
            message
        );
    }

    async checkInbox(): Promise<CheckMailInboxEntry[]> {
        const user = this.user;
        return this.checkMailInbox.execute(user.id);
    }

    async readMessage(tag: number) {
        //
    }
}
