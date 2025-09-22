import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { CreateUserPort } from '../../ports/CreateUserPort';
import { IEncryptor } from '../../interfaces/interactors/IEncryptor';
import { IUIDGenerator } from '../../interfaces/interactors/IUIDGenerator';
import { UserSchema, User } from '../../../domain/entities/User';

export class CreateUser {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly encryptor: IEncryptor,
        private readonly uidGenerator: IUIDGenerator
    ) {}

    async execute(createUserPort: CreateUserPort) {
        const user: User = UserSchema.parse({
            id: this.uidGenerator.getUID(),
            name: createUserPort.name,
            password: this.encryptor.encryptPassword(createUserPort.password),
            email: createUserPort.email,
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
