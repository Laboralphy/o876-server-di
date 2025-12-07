import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ITime } from '../../ports/services/ITime';
import { IServerConfig } from '../../ports/services/IServerConfig';
import { Cradle } from '../../../boot/container';
import { MailMessage } from '../../../domain/entities/MailMessage';
import { IIdGenerator } from '../../ports/services/IIdGenerator';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

/**
 * Sends a message to a user
 */
export class SendMail {
    private readonly mailMessageRepository: IMailMessageRepository;
    private readonly userRepository: IUserRepository;
    private readonly time: ITime;
    private readonly serverConfig: IServerConfig;
    private readonly idGenerator: IIdGenerator;

    constructor(cradle: Cradle) {
        this.mailMessageRepository = cradle.mailMessageRepository;
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
        this.serverConfig = cradle.serverConfig;
        this.idGenerator = cradle.idGenerator;
    }

    async execute(senderId: string, recipientId: string, content: string) {
        const userRecipient = await this.userRepository.get(recipientId);
        if (!userRecipient) {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` user : ${recipientId}`);
        }
        const tsSent = this.time.now();
        const message: MailMessage = {
            id: this.idGenerator.generateUID(),
            content: content.substring(0, this.serverConfig.getVariables().mailMaxMessageLength),
            recipientId: recipientId,
            senderId,
            tsSent,
        };
        await this.mailMessageRepository.save(message);
    }
}
