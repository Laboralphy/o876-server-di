import { Cradle } from '../../../boot/container';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { MailInbox } from '../../../domain/entities/MailInbox';
import { User } from '../../../domain/entities/User';
import { IMailInboxRepository } from '../../../domain/ports/repositories/IMailInboxRepository';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';

/**
 * Deletes a mail inbox entry
 */
export class FindMailByTag {
    private readonly mailInboxRepository: IMailInboxRepository;
    private readonly mailMessageRepository: IMailMessageRepository;
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.mailInboxRepository = cradle.mailInboxRepository;
        this.mailMessageRepository = cradle.mailMessageRepository;
        this.userRepository = cradle.userRepository;
    }

    async execute(
        userId: string,
        tag: number
    ): Promise<{ id: string; date: Date; sender: User; topic: string; body: string } | undefined> {
        const aInbox: MailInbox[] = await this.mailInboxRepository.findByUserId(userId);
        const mib = aInbox.find((mib) => mib.tag === tag);
        if (mib) {
            // Get the corresponding message
            const message = await this.mailMessageRepository.get(mib.messageId);
            const sender = await this.userRepository.get(mib.userId);
            if (sender && message) {
                return {
                    id: mib.userId + '-' + mib.messageId,
                    sender,
                    date: new Date(mib.tsReceived),
                    topic: message.topic,
                    body: message.content,
                };
            }
        } else {
            throw new ReferenceError(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` tag "${tag}"`);
        }
    }
}
