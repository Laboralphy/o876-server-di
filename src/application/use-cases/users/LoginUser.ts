import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { IEncryptor } from '../../ports/services/IEncryptor';

/**
 * Checks if specified username / password matches the user
 */
export class LoginUser {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly encryptor: IEncryptor
    ) {}

    async execute(name: string, password: string): Promise<User | null> {
        const encryptedPassword = this.encryptor.encryptPassword(password);
        const user = await this.userRepository.findByName(name);
        return user && user.password === encryptedPassword ? user : null;
    }
}
