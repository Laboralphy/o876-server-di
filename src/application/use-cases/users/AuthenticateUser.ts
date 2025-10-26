import { Cradle } from '../../../boot/container';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { User } from '../../../domain/entities/User';
import { ITime } from '../../ports/services/ITime';

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

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
        this.encryptor = cradle.encryptor;
        this.time = cradle.time;
    }

    async execute(login: string, password: string): Promise<User> {
        const encryptedPassword = this.encryptor.encryptPassword(password);
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
        await this.userRepository.save(user);
        return user;
    }
}
