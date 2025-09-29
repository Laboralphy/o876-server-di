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
            const nNow = this.time.now();
            if (user.ban) {
                if (!user.ban.forever && nNow >= user.ban.tsEnd) {
                    // ban is removed
                    return false;
                }
                let bannedBy = '[admin]';
                if (user.ban.bannedBy) {
                    const moderator = await this.userRepository.get(user.ban.bannedBy);
                    bannedBy = moderator?.name ?? '[unknown user]';
                }
                return {
                    forever: user.ban.forever,
                    reason: user.ban.reason,
                    bannedBy,
                    until: user.ban.tsEnd,
                    duration: this.time.renderDuration(this.time.now() - user.ban.tsEnd),
                };
            } else {
                return false;
            }
        } else {
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
