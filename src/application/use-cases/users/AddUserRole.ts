import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { ModifyUserRolesDto } from '../../dto/ModifyUserRolesDto';
import { UseCaseError } from '../../error/UseCaseError';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

export class AddUserRole {
    private userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string, dto: ModifyUserRolesDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            const currentRoles = new Set(user.roles);
            dto.roles.forEach((role) => {
                currentRoles.add(role);
            });
            user.roles = [...currentRoles];
            await this.userRepository.save(user);
            return user;
        } else {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${idUser}`);
        }
    }
}
