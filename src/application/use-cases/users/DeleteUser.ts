import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../boot/container';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';

export class DeleteUser {
    private readonly userRepository: IUserRepository;
    private readonly userSecretRepository: IUserSecretRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
    }

    async execute(idUser: string) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            const userSecret = await this.userSecretRepository.get(idUser);
            if (userSecret) {
                await this.userSecretRepository.delete(userSecret);
            }
            await this.userRepository.delete(user);
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
