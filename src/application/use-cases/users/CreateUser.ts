import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { CreateUserDto } from '../../dto/CreateUserDto';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IUIDGenerator } from '../../ports/services/IUIDGenerator';
import { UserSchema, User } from '../../../domain/entities/User';
import { Cradle } from '../../../config/container';

export class CreateUser {
    private readonly userRepository: IUserRepository;
    private readonly encryptor: IEncryptor;
    private readonly uidGenerator: IUIDGenerator;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.encryptor = cradle.encryptor;
        this.uidGenerator = cradle.uidGenerator;
    }

    async execute(createUserDto: CreateUserDto): Promise<User> {
        const user: User = UserSchema.parse({
            id: this.uidGenerator.getUID(),
            name: createUserDto.name,
            password: this.encryptor.encryptPassword(createUserDto.password),
            email: createUserDto.email,
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
        return user;
    }
}
