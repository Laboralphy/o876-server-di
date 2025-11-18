import { Cradle } from '../../../boot/container';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';
import { UserSecret, UserSecretSchema } from '../../../domain/entities/UserSecret';

export class SetUserPassword {
    private encryptor: IEncryptor;
    private userSecretRepository: IUserSecretRepository;

    constructor(cradle: Cradle) {
        this.encryptor = cradle.encryptor;
        this.userSecretRepository = cradle.userSecretRepository;
    }

    setPassword(idUser: string, password: string) {
        return this.userSecretRepository.save(
            UserSecretSchema.parse({
                id: idUser,
                password: this.encryptor.encryptPassword(password),
            })
        );
    }

    checkPassword(userSecret: UserSecret, password: string) {
        return userSecret.password == this.encryptor.encryptPassword(password);
    }

    async execute(idUser: string, password: string, prevPassword: string, force: boolean = false) {
        const userSecret = await this.userSecretRepository.get(idUser);
        if (!userSecret || force) {
            // prevPassword is ignored, because there is no user secret to compare to.
            // juste store the new password and go.
            // This is typically an admin move. (deleting secret and forcing new password)
            await this.setPassword(idUser, password);
            return true;
        } else if (this.checkPassword(userSecret, prevPassword)) {
            // prev password match -> change password
            await this.setPassword(idUser, password);
            return true;
        } else {
            // something went wrong
            return false;
        }
    }
}
