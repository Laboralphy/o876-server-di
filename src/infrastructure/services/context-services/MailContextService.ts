import { User } from '../../../domain/entities/User';
import { SendMail } from '../../../application/use-cases/mail/SendMail';
import { ClientCradle } from '../../../boot/container';
import { AbstractContextService } from './AbstractContextService';
import { ReadMail } from '../../../application/use-cases/mail/ReadMail';
import { ListMail } from '../../../application/use-cases/mail/ListMail';

export class MailContextService extends AbstractContextService {
    private readonly sendMail: SendMail;
    private readonly readMail: ReadMail;
    private readonly listMail: ListMail;

    constructor(cradle: ClientCradle) {
        super(cradle);
        this.sendMail = cradle.sendMail;
        this.readMail = cradle.readMail;
        this.listMail = cradle.listMail;
    }

    async sendMessage(recipient: User, message: string): Promise<void> {
        const user = this.user;
        return this.sendMail.execute(user.id, recipient.id, message);
    }

    async readMessage() {
        return this.readMail.execute(this.user.id);
    }

    async listMessages() {
        return this.listMail.execute(this.user.id);
    }
}
