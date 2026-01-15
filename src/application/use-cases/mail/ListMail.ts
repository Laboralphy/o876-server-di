import { Cradle } from '../../../boot/container';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ITime } from '../../ports/services/ITime';
import { IServerConfig } from '../../ports/services/IServerConfig';
import { User } from '../../../domain/entities/User';

type ListMessageResult = {
    tsSent: number;
    sender: User | undefined;
    preview: string;
};

export class ListMail {
    private readonly mailMessageRepository: IMailMessageRepository;
    private readonly userRepository: IUserRepository;
    private readonly time: ITime;
    private readonly serverConfig: IServerConfig;

    constructor(cradle: Cradle) {
        this.mailMessageRepository = cradle.mailMessageRepository;
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
        this.serverConfig = cradle.serverConfig;
    }

    /**
     * Message older than the expiration delay are deleted
     */
    async deleteExpiredMessages() {
        // Delete expired messages
        const tsExpire =
            this.time.now() -
            this.serverConfig.getVariables().mailMaxExpirationDays * 24 * 3600 * 1000;
        const aExpiredMessages = await this.mailMessageRepository.findExpiredMessages(tsExpire);
        await Promise.all(aExpiredMessages.map((m) => this.mailMessageRepository.delete(m)));
    }

    /**
     * Reads the least recent mail message and deletes it
     * @param userId
     */
    async execute(userId: string): Promise<ListMessageResult[]> {
        await this.deleteExpiredMessages();
        // Read user message
        const aMessages = await this.mailMessageRepository.findUserMessages(userId);
        return Promise.all(
            aMessages
                .sort((m1, m2) => m1.tsSent - m2.tsSent)
                .map((m) =>
                    this.userRepository.get(m.senderId).then((user) => ({
                        tsSent: m.tsSent,
                        sender: user,
                        preview: m.content.substring(0, 40),
                    }))
                )
        );
    }
}
