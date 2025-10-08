import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { User } from '../../../domain/entities/User';

export class FindUser {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(name: string): Promise<User | undefined> {
        const user = await this.userRepository.findByName(name);
        if (user) {
            return user;
        } else {
            return undefined;
        }
    }
}
