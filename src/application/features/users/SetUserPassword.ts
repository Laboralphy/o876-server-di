import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IEncryptor } from '../../interfaces/interactors/IEncryptor';

export class SetUserPassword {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly encryptor: IEncryptor
    ) {}

    async execute(user: User, password: string) {
        user.password = this.encryptor.encryptPassword(password);
        await this.userRepository.save(user);
    }
}
