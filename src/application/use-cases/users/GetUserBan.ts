import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { ITime } from '../../ports/services/ITime';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

export class GetUserBan {
    private userRepository: IUserRepository;
    private time: ITime;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
    }

    /**
     * Specifically fetch user.ban
     * If ban has expired or if banned user has been deleted
     * @param idUser
     */
    async execute(idUser: string) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            // check if bannedBy user is still active
            if (user.ban) {
                let userModified = false;
                if (user.ban.bannedBy) {
                    const bannedByUser = await this.userRepository.get(user.ban.bannedBy);
                    if (!bannedByUser) {
                        // bannedByUser does not exist : this happens when user A bans user B, and user A gets deleted
                        // immediately empty user.ban.bannedBy and update
                        user.ban.bannedBy = '';
                        userModified = true;
                    }
                }
                if (user.ban.forever || user.ban.tsEnd > this.time.now()) {
                    // ban exists and is still active
                    return user.ban;
                } else {
                    // ban has expired : do not keep it
                    user.ban = null;
                    userModified = true;
                }
                if (userModified) {
                    // user has been modified, and must be saved
                    await this.userRepository.save(user);
                }
            }
            // at this point, user.ban is either non-inexistent or expired
            return null;
        } else {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${idUser}`);
        }
    }
}
