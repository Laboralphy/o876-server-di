import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../config/container';
import { BanUserDto } from '../../dto/BanUserDto';
import { ITime } from '../../ports/services/ITime';

export class UnbanUser {
    private userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            user.ban = null;
            await this.userRepository.save(user);
            return user;
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
