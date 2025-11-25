import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ModifyUserDto, ModifyUserDtoSchema } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../boot/container';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';

export class ModifyUser {
    private readonly userRepository: IUserRepository;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
    }

    async execute(idUser: string, dto: ModifyUserDto) {
        dto = ModifyUserDtoSchema.parse(dto);
        const user = await this.userRepository.get(idUser);
        if (user) {
            let modified = false;
            if (dto.email) {
                user.email = dto.email;
                modified = true;
            }
            if (dto.displayName) {
                if (await this.userRepository.findByDisplayName(dto.displayName)) {
                    throw new Error(USE_CASE_ERRORS.VALUE_ALREADY_EXISTS + ' display name');
                }
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
