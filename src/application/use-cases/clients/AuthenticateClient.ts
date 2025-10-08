import { IClientRepository } from '../../../domain/ports/repositories/IClientRepository';
import { Cradle } from '../../../config/container';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { User } from '../../../domain/entities/User';
import { Client, CLIENT_STAGES } from '../../../domain/entities/Client';
import { ITime } from '../../ports/services/ITime';
import { GetUserBan } from '../users/GetUserBan';

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
    private readonly getUserBan: GetUserBan;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
        this.encryptor = cradle.encryptor;
        this.time = cradle.time;
        this.getUserBan = cradle.getUserBan;
    }

    async execute(clientId: string, login: string, password: string): Promise<Client> {
        const encryptedPassword = this.encryptor.encryptPassword(password);
        const client: Client | undefined = await this.clientRepository.get(clientId);
        if (!client) {
            throw new Error(`invalid client id ${clientId}`);
        }
        const user: User | undefined = await this.userRepository.findByName(login);
        if (!user) {
            throw new Error(`user not found ${login}`);
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
        const ban = await this.getUserBan.execute(user.id);
        client.stage = ban ? CLIENT_STAGES.BANNED : CLIENT_STAGES.AUTHENTICATED;
        await this.userRepository.save(user);
        await this.clientRepository.save(client);
        return client;
    }
}
