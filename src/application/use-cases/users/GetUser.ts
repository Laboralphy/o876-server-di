import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { User } from '../../../domain/entities/User';

/**
 * Returns User identified by spécified identifier
 * Returns undefined if identifier could not be associated with an entity
 */
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
