import { Cradle } from '../../../boot/container';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ITime } from '../../ports/services/ITime';
import { IServerConfig } from '../../ports/services/IServerConfig';
import { User } from '../../../domain/entities/User';

type ReadMessageResult = {
    message: string;
    sender: User | undefined;
    tsSent: number;
    remaining: number;
};

export class ReadMail {
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
     * Reads the least recent mail message and deletes it
     * @param userId
     */
    async execute(userId: string): Promise<ReadMessageResult | undefined> {
        // Delete expired messages
        const tsExpire =
            this.time.now() -
            this.serverConfig.getVariables().mailMaxExpirationDays * 24 * 3600 * 1000;
        const aExpiredMessages = await this.mailMessageRepository.findExpiredMessages(tsExpire);
        await Promise.all(aExpiredMessages.map((m) => this.mailMessageRepository.delete(m)));

        // Read user message
        const aMessages = await this.mailMessageRepository.findUserMessages(userId);
        aMessages.sort((m1, m2) => m1.tsSent - m2.tsSent);
        const message = aMessages.shift();
        if (message) {
            const sender = await this.userRepository.get(message.senderId);
            await this.mailMessageRepository.delete(message);
            return {
                sender,
                message: message.content,
                tsSent: message.tsSent,
                remaining: aMessages.length,
            };
        } else {
            return undefined;
        }
    }
}
