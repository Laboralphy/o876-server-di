import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { User } from '../../../domain/entities/User';
import { FindUserDto } from '../../dto/FindUserDto';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

export class FindUser {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(dto: FindUserDto): Promise<User | undefined> {
        if (dto.name !== undefined) {
            return this.userRepository.findByName(dto.name);
        } else if (dto.displayName === undefined) {
            throw new Error(USE_CASE_ERRORS.FORBIDDEN + ' Find user criterium');
        } else {
            return this.userRepository.findByDisplayName(dto.displayName);
        }
    }
}
