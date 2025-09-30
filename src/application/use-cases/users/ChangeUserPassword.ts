import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../config/container';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IUserSecretRepository } from '../../ports/repositories/IUserSecretRepository';

export class ChangeUserPassword {
    private encryptor: IEncryptor;
    private userSecretRepository: IUserSecretRepository;

    constructor(cradle: Cradle) {
        this.encryptor = cradle.encryptor;
        this.userSecretRepository = cradle.userSecretRepository;
    }

    async execute(idUser: string, password: string) {
        const userSecret = await this.userSecretRepository.get(idUser);
        if (userSecret) {
            userSecret.password = this.encryptor.encryptPassword(password);
            await this.userSecretRepository.save(userSecret);
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
