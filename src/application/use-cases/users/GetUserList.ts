import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { User, UserSchema } from '../../../domain/entities/User';

export class GetUserList {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(): Promise<User[]> {
        const aUsers: User[] = [];
        await this.userRepository.forEach((u: User) => {
            aUsers.push(UserSchema.parse(u));
        });
        return aUsers;
    }
}
