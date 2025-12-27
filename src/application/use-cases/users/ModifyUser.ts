import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ModifyUserDto, ModifyUserDtoSchema } from '../../dto/ModifyUserDto';
import { Cradle } from '../../../boot/container';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';

export class ModifyUser {
    private readonly userRepository: IUserRepository;
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.communicationLayer = cradle.communicationLayer;
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
            if (typeof dto.female == 'boolean') {
                user.female = dto.female;
                modified = true;
            }
            if (modified) {
                await this.userRepository.save(user);
                const clientSession = this.communicationLayer.getUserClient(user);
                if (clientSession) {
                    clientSession.user = user;
                }
            }
            return user;
        } else {
            throw new Error(USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` User : ${idUser}`);
        }
    }
}
