import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { User } from '../../../domain/entities/User';
import { UserListDto } from '../../dto/UserListDto';

export class GetUserList {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(): Promise<UserListDto> {
        const aUsers: UserListDto = [];
        await this.userRepository.forEach((u: User) => {
            aUsers.push({
                id: u.id,
                name: u.name,
                tsCreated: u.tsCreation,
                tsLogin: u.tsLastUsed,
                email: u.email,
            });
        });
        return aUsers;
    }
}
