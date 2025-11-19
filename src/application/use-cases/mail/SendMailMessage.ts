import { IMailInboxRepository } from '../../../domain/ports/repositories/IMailInboxRepository';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ITime } from '../../ports/services/ITime';
import { IServerConfig } from '../../ports/services/IServerConfig';
import { Cradle } from '../../../boot/container';
import { MailMessage } from '../../../domain/entities/MailMessage';
import { IIdGenerator } from '../../ports/services/IIdGenerator';
import { User } from '../../../domain/entities/User';
import { MailInbox } from '../../../domain/entities/MailInbox';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

/**
 * Sends a message to a user
 */
export class SendMailMessage {
    private readonly mailInboxRepository: IMailInboxRepository;
    private readonly mailMessageRepository: IMailMessageRepository;
    private readonly userRepository: IUserRepository;
    private readonly time: ITime;
    private readonly serverConfig: IServerConfig;
    private readonly idGenerator: IIdGenerator;

    constructor(cradle: Cradle) {
        this.mailInboxRepository = cradle.mailInboxRepository;
        this.mailMessageRepository = cradle.mailMessageRepository;
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
        this.serverConfig = cradle.serverConfig;
        this.idGenerator = cradle.idGenerator;
    }

    getUserFromNames(aNames: string[]): Promise<(User | undefined)[]> {
        return Promise.all(aNames.map((name: string) => this.userRepository.findByName(name)));
    }

    async getMailInboxTags(userId: string): Promise<number[]> {
        const aInbox: MailInbox[] = await this.mailInboxRepository.findByUserId(userId);
        return aInbox.map((mib: MailInbox) => mib.tag);
    }

    async execute(senderId: string, recipientNames: string[], topic: string, content: string) {
        const aMaybeUsers = await this.getUserFromNames(recipientNames);
        const recipientIds: string[] = [];
        const notFoundUserSet = new Set<string>();
        for (let i = 0; i < recipientNames.length; i += 1) {
            const user = aMaybeUsers[i];
            if (user) {
                recipientIds.push(user.id);
            } else {
                notFoundUserSet.add(recipientIds[i]);
            }
        }
        if (notFoundUserSet.size > 0) {
            const sNotFoundUsers = Array.from(notFoundUserSet).join(', ');
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${sNotFoundUsers}`);
        }
        const tsCreation = this.time.now();
        const message: MailMessage = {
            id: this.idGenerator.generateUID(),
            content: content.substring(
                0,
                this.serverConfig.getConfigVariableNumber('mailMaxMessageLength')
            ),
            topic: topic.substring(
                0,
                this.serverConfig.getConfigVariableNumber('mailMaxTopicLength')
            ),
            recipientIds,
            senderId,
            tsCreation,
        };
        await this.mailMessageRepository.save(message);
        // Populate inbox for all recipientIds
        const promSend = recipientIds.map(async (userId: string) => {
            const aTags = await this.getMailInboxTags(userId);
            const tag = this.idGenerator.getMinimalMissingValue(aTags);
            const mib: MailInbox = {
                userId,
                messageId: message.id,
                tag,
                tsReceived: tsCreation,
                deleted: false,
                kept: false,
                read: false,
            };
            return this.mailInboxRepository.save(mib);
        });
        await Promise.all(promSend);
    }
}
