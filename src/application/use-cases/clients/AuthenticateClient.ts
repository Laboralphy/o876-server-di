import { IClientRepository } from '../../ports/repositories/IClientRepository';
import { Cradle } from '../../../config/container';
import { IUserSecretRepository } from '../../ports/repositories/IUserSecretRepository';
import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { User } from '../../../domain/entities/User';
import { Client, CLIENT_STAGES } from '../../../domain/entities/Client';
import { ITime } from '../../ports/services/ITime';

/**
 * This use case will check if specified client-login & password
 * matches the registered user + secret
 * if so then the user is returns,
 * else a null value is returned after a delay
 */
export class AuthenticateClient {
    private readonly clientRepository: IClientRepository;
    private readonly userRepository: IUserRepository;
    private readonly userSecretRepository: IUserSecretRepository;
    private readonly encryptor: IEncryptor;
    private readonly time: ITime;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
        this.encryptor = cradle.encryptor;
        this.time = cradle.time;
    }

    async execute(clientId: string, password: string): Promise<User> {
        const encryptedPassword = this.encryptor.encryptPassword(password);
        const client: Client | undefined = await this.clientRepository.get(clientId);
        if (!client) {
            throw new Error(`invalid client id ${clientId}`);
        }
        if (client.stage !== CLIENT_STAGES.PASSWORD) {
            throw new Error(`invalid client stage. expected PASSWORD, got ${client.stage}`);
        }
        if (client.login === null) {
            throw new Error(`incoherent client state : should have login property set`);
        }
        const user: User | undefined = await this.userRepository.findByName(client.login);
        if (!user) {
            throw new Error(`user not found ${client.login}`);
        }
        const userSecret = await this.userSecretRepository.get(user.id);
        if (!userSecret) {
            throw new Error(`user secret not found ${user.id}`);
        }
        if (userSecret.password !== encryptedPassword) {
            throw new Error(`user login/password error`);
        }
        user.tsLastUsed = this.time.now();
        client.user = user.id;
        client.stage = CLIENT_STAGES.CONNECTED;
        await this.userRepository.save(user);
        await this.clientRepository.save(client);
        return user;
    }
}
