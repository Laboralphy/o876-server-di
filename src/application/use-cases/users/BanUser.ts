import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../config/container';
import { BanUserDto } from '../../dto/BanUserDto';
import { ITime } from '../../ports/services/ITime';

export class BanUser {
    private userRepository: IUserRepository;
    private time: ITime;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
    }

    async execute(idUser: string, dto: BanUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            const nNow = this.time.now();
            const forever = dto.duration == Infinity;
            let bannedBy: string = '';
            if (dto.bannedBy) {
                // checks if dto.bannedBy exists
                const bannedByUser = await this.userRepository.get(dto.bannedBy);
                if (!bannedByUser) {
                    throw new Error(`BannedByUser does not exist: ${dto.bannedBy}`);
                }
                bannedBy = dto.bannedBy;
            } // bannedBy should be either a valid user id or an empty string
            user.ban = {
                tsBegin: nNow,
                tsEnd: forever ? 0 : nNow + dto.duration,
                forever,
                reason: dto.reason,
                bannedBy: bannedBy == '' ? null : bannedBy,
            };
            await this.userRepository.save(user);
            return user;
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
