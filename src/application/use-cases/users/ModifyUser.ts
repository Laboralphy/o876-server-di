import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ModifyUserDto } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../boot/container';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { CreateUser } from './CreateUser';

export class ModifyUser {
    private readonly userRepository: IUserRepository;
    private readonly createUser: CreateUser;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.createUser = cradle.createUser;
    }

    async execute(idUser: string, dto: ModifyUserDto) {
        const user = await this.userRepository.get(idUser);
        if (user) {
            let modified = false;
            if (dto.email) {
                this.createUser.checkEmail(dto.email);
                user.email = dto.email;
                modified = true;
            }
            if (dto.displayName) {
                await this.createUser.checkDisplayName(dto.displayName);
                user.displayName = dto.displayName;
                modified = true;
            }
            if (dto.roles) {
                user.roles = dto.roles;
                modified = true;
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
