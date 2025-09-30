import { IUserRepository } from '../../ports/repositories/IUserRepository';
import { CreateUserDto } from '../../dto/CreateUserDto';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IUIDGenerator } from '../../ports/services/IUIDGenerator';
import { UserSchema, User } from '../../../domain/entities/User';
import { Cradle } from '../../../config/container';
import { UserSecretSchema } from '../../../domain/entities/UserSecret';
import { IUserSecretRepository } from '../../ports/repositories/IUserSecretRepository';

/**
 * Creates a new User
 */
export class CreateUser {
    private readonly userRepository: IUserRepository;
    private readonly userSecretRepository: IUserSecretRepository;
    private readonly encryptor: IEncryptor;
    private readonly uidGenerator: IUIDGenerator;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
        this.encryptor = cradle.encryptor;
        this.uidGenerator = cradle.uidGenerator;
    }

    async execute(createUserDto: CreateUserDto): Promise<User> {
        const nNow = Date.now();
        const password = this.encryptor.encryptPassword(createUserDto.password);
        const user: User = UserSchema.parse({
            id: this.uidGenerator.getUID(),
            name: createUserDto.name,
            email: createUserDto.email,
            tsCreation: nNow,
            tsLastUsed: nNow,
            roles: [],
            ban: null,
        });
        const userSecret = UserSecretSchema.parse({
            id: user.id,
            password,
        });
        await this.userSecretRepository.save(userSecret);
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
