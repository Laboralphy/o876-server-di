import { User } from '../../../domain/entities/User';
import { SendMail } from '../../../application/use-cases/mail/SendMail';
import { ClientCradle } from '../../../boot/container';
import { AbstractContextService } from './AbstractContextService';
import { ReadMail } from '../../../application/use-cases/mail/ReadMail';

export class MailContextService extends AbstractContextService {
    private readonly sendMail: SendMail;
    private readonly readMail: ReadMail;

    constructor(cradle: ClientCradle) {
        super(cradle);
        this.sendMail = cradle.sendMail;
        this.readMail = cradle.readMail;
    }

    async sendMessage(recipient: User, message: string): Promise<void> {
        const user = this.user;
        return this.sendMail.execute(user.id, recipient.id, message);
    }

    async readMessage() {
        return this.readMail.execute(this.user.id);
    }
}
