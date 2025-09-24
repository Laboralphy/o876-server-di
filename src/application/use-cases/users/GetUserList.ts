import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { User } from '../../../domain/entities/User';

export class GetUserList {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(): Promise<User[]> {
        console.log(await this.userRepository.getAll());
        return this.userRepository.getAll();
    }
}
