import { createContainer, asClass } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/InMemory/UserRepository';
import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';
import { CreateUser } from '../application/use-cases/users/CreateUser';
import { LoginUser } from '../application/use-cases/users/LoginUser';
import { SetUserPassword } from '../application/use-cases/users/SetUserPassword';
import { UserController } from '../infrastructure/web/controllers/UserController';

export interface Cradle {
    // use cases
    createUser: CreateUser;
    loginUser: LoginUser;
    setUserPassword: SetUserPassword;

    // repositories
    userRepository: UserRepository;

    // controller
    userController: UserController;

    // services
    encryptor: Encryptor;
    uidGenerator: UIDGenerator;
}

// Container creation
export const container = createContainer<Cradle>();

// Registering dependencies
container.register({
    // use cases
    createUser: asClass(CreateUser),
    loginUser: asClass(LoginUser),
    setUserPassword: asClass(SetUserPassword),

    // repositories
    userRepository: asClass(UserRepository),

    // controller
    userController: asClass(UserController),

    // services
    encryptor: asClass(Encryptor),
    uidGenerator: asClass(UIDGenerator),
});
