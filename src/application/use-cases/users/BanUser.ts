import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../config/container';

export class BanUser {
    private userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string, dto: ModifyUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            await this.userRepository.save(user);
            return user;
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
