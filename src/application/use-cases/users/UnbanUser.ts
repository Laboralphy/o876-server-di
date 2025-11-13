import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../boot/container';
import { BanUserDto } from '../../dto/BanUserDto';
import { ITime } from '../../ports/services/ITime';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

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
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${idUser}`);
        }
    }
}
