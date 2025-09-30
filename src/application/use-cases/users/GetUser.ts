import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { User } from '../../../domain/entities/User';

export class GetUser {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(id: string): Promise<User | undefined> {
        const user = await this.userRepository.get(id);
        if (user) {
            return user;
        } else {
            return undefined;
        }
    }
}
