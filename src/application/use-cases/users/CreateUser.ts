import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { CreateUserDto } from '../../dto/CreateUserDto';
import { IEncryptor } from '../../ports/services/IEncryptor';
import { IIdGenerator } from '../../ports/services/IIdGenerator';
import { UserSchema, User } from '../../../domain/entities/User';
import { Cradle } from '../../../boot/container';
import { UserSecretSchema } from '../../../domain/entities/UserSecret';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { IServerConfig } from '../../ports/services/IServerConfig';
import { ITime } from '../../ports/services/ITime';

/**
 * Creates a new User
 */
export class CreateUser {
    private readonly userRepository: IUserRepository;
    private readonly userSecretRepository: IUserSecretRepository;
    private readonly encryptor: IEncryptor;
    private readonly idGenerator: IIdGenerator;
    private readonly serverConfig: IServerConfig;
    private readonly time: ITime;

    constructor(cradle: Cradle) {
        this.userRepository = cradle.userRepository;
        this.userSecretRepository = cradle.userSecretRepository;
        this.encryptor = cradle.encryptor;
        this.idGenerator = cradle.idGenerator;
        this.serverConfig = cradle.serverConfig;
        this.time = cradle.time;
    }

    async checkDisplayName(displayName: string) {
        // checks displayName : must be unique to all users, must not be like : "new"
        if (displayName.toLowerCase() === this.serverConfig.getVariables().loginNewUser) {
            throw new Error(
                USE_CASE_ERRORS.VALUE_RESERVED + ' Display name : this value is reserved'
            );
        }
        // Check unicity
        const oUserWithThisName = await this.userRepository.findByDisplayName(displayName);
        if (oUserWithThisName) {
            throw new Error(
                USE_CASE_ERRORS.VALUE_ALREADY_EXISTS + ` Display name : ${displayName} `
            );
        }
    }

    async execute(createUserDto: CreateUserDto): Promise<User> {
        const nNow = this.time.now();
        const password = this.encryptor.encryptPassword(createUserDto.password);
        const user: User = UserSchema.parse({
            id: this.idGenerator.generateUID(),
            name: createUserDto.name,
            email: createUserDto.email,
            displayName: createUserDto.displayName,
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
            throw new Error(USE_CASE_ERRORS.VALUE_ALREADY_EXISTS + ` ${user.name}`);
        }
        if (await this.userRepository.get(user.id)) {
            throw new Error(USE_CASE_ERRORS.VALUE_ALREADY_EXISTS + ` ${user.id}`);
        }
        if (user.name === this.serverConfig.getVariables().loginNewUser) {
            throw new Error(USE_CASE_ERRORS.VALUE_RESERVED + ' name : this value is reserved');
        }
        if (await this.userRepository.findByDisplayName(user.displayName)) {
            throw new Error(
                USE_CASE_ERRORS.VALUE_ALREADY_EXISTS + ` Display name : ${user.displayName} `
            );
        }
        await this.checkDisplayName(user.displayName);
        await this.userRepository.save(user);
        return user;
    }
}
