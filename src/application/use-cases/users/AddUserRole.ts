import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { Cradle } from '../../../boot/container';
import { ModifyUserRolesDto } from '../../dto/ModifyUserRolesDto';

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
            throw new Error(`User does not exist: ${idUser}`);
        }
    }
}
