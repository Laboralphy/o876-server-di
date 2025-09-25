import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { User } from '../../../domain/entities/User';

export class GetUserList {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(): Promise<{ [name: string]: string }> {
        const oUsers: { [name: string]: string } = {};
        await this.userRepository.forEach((u: User) => {
            oUsers[u.id] = u.name;
        });
        return oUsers;
    }
}
