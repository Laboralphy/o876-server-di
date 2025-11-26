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

    getUserFromIds(ids: string[]): Promise<(User | undefined)[]> {
        return Promise.all(ids.map((id: string) => this.userRepository.get(id)));
    }

    async getMailInboxTags(userId: string): Promise<number[]> {
        const aInbox: MailInbox[] = await this.mailInboxRepository.findByUserId(userId);
        return aInbox.map((mib: MailInbox) => mib.tag);
    }

    async execute(senderId: string, recipientIds: string[], topic: string, content: string) {
        const aMaybeUsers = await this.getUserFromIds(recipientIds);
        const notFoundUserSet = new Set<string>();
        const foundUsers = new Set<User>();
        for (let i = 0; i < recipientIds.length; i += 1) {
            const user = aMaybeUsers[i];
            if (user) {
                foundUsers.add(user);
            } else {
                notFoundUserSet.add(recipientIds[i]);
            }
        }
        if (notFoundUserSet.size > 0) {
            const sNotFoundUsers = Array.from(notFoundUserSet).join(', ');
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User ids : ${sNotFoundUsers}`);
        }
        const foundUserIds = Array.from(foundUsers).map((user: User) => user.id);
        const tsCreation = this.time.now();
        const message: MailMessage = {
            id: this.idGenerator.generateUID(),
            content: content.substring(0, this.serverConfig.getVariables().mailMaxMessageLength),
            topic: topic.substring(0, this.serverConfig.getVariables().mailMaxTopicLength),
            recipientIds: foundUserIds,
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
