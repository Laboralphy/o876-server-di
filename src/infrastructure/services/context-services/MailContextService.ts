import { User } from '../../../domain/entities/User';
import { SendMail } from '../../../application/use-cases/mail/SendMail';
import {
    CheckMailInbox,
    CheckMailInboxEntry,
} from '../../../application/use-cases/mail/CheckMailInbox';
import { ClientCradle } from '../../../boot/container';
import { AbstractContextService } from './AbstractContextService';
import { FindMailByTag } from '../../../application/use-cases/mail/FindMailByTag';
import { SetMailFlags } from '../../../application/use-cases/mail/SetMailFlags';
import { SetMailFlagsDto } from '../../../application/dto/SetMailFlagsDto';

export class MailContextService extends AbstractContextService {
    private readonly sendMail: SendMail;
    private readonly checkMailInbox: CheckMailInbox;
    private readonly findMailByTag: FindMailByTag;
    private readonly setMailFlags: SetMailFlags;

    constructor(cradle: ClientCradle) {
        super(cradle);
        this.sendMail = cradle.sendMail;
        this.checkMailInbox = cradle.checkMailInbox;
        this.findMailByTag = cradle.findMailByTag;
        this.setMailFlags = cradle.setMailFlags;
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
        const msg = await this.findMailByTag.execute(this.user.id, tag);
        if (msg) {
            // change read flag
            await this.setMailFlags.execute(msg.id, { read: true });
            return msg;
        }
    }

    async setMessageFlags(tag: number, flags: SetMailFlagsDto) {
        const msg = await this.findMailByTag.execute(this.user.id, tag);
        if (msg) {
            // change read flag
            await this.setMailFlags.execute(msg.id, flags);
            return true;
        } else {
            return msg;
        }
    }
}
