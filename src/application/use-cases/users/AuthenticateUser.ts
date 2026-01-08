import { Cradle } from '../../../boot/container';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { User } from '../../../domain/entities/User';
import { ITime } from '../../ports/services/ITime';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { IChatManager } from '../../ports/services/IChatManager';
import { IGMCPGateway } from '../../ports/services/IGMCPGateway';

/**
 * This use case will check if specified client-login & password
 * matches the registered user + secret
 * if so then the user is returns,
 * else a null value is returned after a delay
 */
export class AuthenticateUser {
    private readonly userRepository: IUserRepository;
    private readonly userSecretRepository: IUserSecretRepository;
    private readonly encryptor: IEncryptor;
    private readonly time: ITime;
    private readonly communicationLayer: ICommunicationLayer;
    private readonly chatManager: IChatManager;
    private readonly gmcpGateway: IGMCPGateway;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
        this.encryptor = cradle.encryptor;
        this.time = cradle.time;
        this.communicationLayer = cradle.communicationLayer;
        this.chatManager = cradle.chatManager;
        this.gmcpGateway = cradle.gmcpGateway;
    }

    /**
     * Execute some user authenticated tasks
     */
    autoexec(user: User) {
        // Registering user in chat system
        this.chatManager.registerUser(user);
    }

    async execute(login: string, password: string): Promise<User> {
        const encryptedPassword = this.encryptor.encryptPassword(password);
        const user: User | undefined = await this.userRepository.findByName(login);
        if (!user) {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${login}`);
        }
        if (this.communicationLayer.getUserClient(user)) {
            // This user is already connected
            throw new Error(USE_CASE_ERRORS.FORBIDDEN + ` User ${login} already connected`);
        }
        const userSecret = await this.userSecretRepository.get(user.id);
        if (!userSecret) {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User secret : ${user.id}`);
        }
        if (userSecret.password !== encryptedPassword) {
            throw new Error(USE_CASE_ERRORS.UNAUTHORIZED + ` User : ${login}`);
        }
        user.tsLastUsed = this.time.now();
        await this.userRepository.save(user);
        await this.autoexec(user);
        return user;
    }
}
