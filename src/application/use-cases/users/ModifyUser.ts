import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../config/container';
import { IEncryptor } from '../../ports/services/IEncryptor';

export class ModifyUser {
    private userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.encryptor = cradle.encryptor;
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string, dto: ModifyUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            let modified = false;
            if (dto.email) {
                if (dto.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                    user.email = dto.email;
                    modified = true;
                } else {
                    throw new TypeError(`Invalid email address ${dto.email}`);
                }
            }
            if (modified) {
                await this.userRepository.save(user);
            }
            return user;
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
