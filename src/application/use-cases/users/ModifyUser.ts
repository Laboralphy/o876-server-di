import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../boot/container';
import { UseCaseError } from '../../error/UseCaseError';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

export class ModifyUser {
    private userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string, dto: ModifyUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            let modified = false;
            if (dto.email) {
                if (dto.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                    user.email = dto.email;
                    modified = true;
                } else {
                    throw new Error(
                        USE_CASE_ERRORS.VALUE_INVALID + ` Email address : ${dto.email}`
                    );
                }
            }
            if (modified) {
                await this.userRepository.save(user);
            }
            return user;
        } else {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${idUser}`);
        }
    }
}
