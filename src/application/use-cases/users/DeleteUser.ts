import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../config/container';
import { IEncryptor } from '../../ports/services/IEncryptor';

export class DeleteUser {
    private encryptor: IEncryptor;
    private userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.encryptor = cradle.encryptor;
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            await this.userRepository.delete(user);
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
