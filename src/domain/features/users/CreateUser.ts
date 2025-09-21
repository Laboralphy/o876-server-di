import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { CreateUserDTO } from '../../dto/CreateUserDTO';
import { IEncryptor } from '../../interfaces/interactors/IEncryptor';
import { IUIDGenerator } from '../../interfaces/interactors/IUIDGenerator';
import { UserSchema, User } from '../../entities/User';

export class CreateUser {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly encryptor: IEncryptor,
        private readonly uidGenerator: IUIDGenerator
    ) {}

    async execute(createUserDTO: CreateUserDTO) {
        const user: User = UserSchema.parse({
            id: this.uidGenerator.getUID(),
            name: createUserDTO.name,
            password: this.encryptor.encryptSHA256(createUserDTO.password),
            email: createUserDTO.email,
            dateCreation: new Date(),
            dateLastUsed: new Date(),
            roles: [],
            ban: null,
        });
        if (await this.userRepository.findByName(user.name)) {
            throw new Error(`User with name "${user.name}" already exists`);
        }
        if (await this.userRepository.get(user.id)) {
            throw new Error(`User with id "${user.id}" already exists`);
        }
        await this.userRepository.save(user);
    }
}
