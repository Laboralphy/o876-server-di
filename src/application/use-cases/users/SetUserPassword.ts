import { Cradle } from '../../../config/container';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';
import { UserSecretSchema } from '../../../domain/entities/UserSecret';
import { id } from 'zod/locales';

export class SetUserPassword {
    private encryptor: IEncryptor;
    private userSecretRepository: IUserSecretRepository;

    constructor(cradle: Cradle) {
        this.encryptor = cradle.encryptor;
        this.userSecretRepository = cradle.userSecretRepository;
    }

    async execute(idUser: string, password: string) {
        const userSecret = await this.userSecretRepository.get(idUser);
        const sEncryptedPassword = this.encryptor.encryptPassword(password);
        if (userSecret) {
            userSecret.password = sEncryptedPassword;
            await this.userSecretRepository.save(userSecret);
        } else {
            const userSecret = UserSecretSchema.parse({
                id: idUser,
                password: sEncryptedPassword,
            });
            await this.userSecretRepository.save(userSecret);
        }
    }
}
