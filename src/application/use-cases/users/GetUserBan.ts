import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { ITime } from '../../ports/services/ITime';

export class GetUserBan {
    private userRepository: IUserRepository;
    private time: ITime;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
    }

    async execute(idUser: string) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            if (user.ban && (user.ban.forever || user.ban.tsEnd > this.time.now())) {
                return user.ban;
            } else {
                return null;
            }
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
