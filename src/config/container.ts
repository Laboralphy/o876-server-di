import { createContainer, asClass } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/in-memory/UserRepository';
import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';
import { CreateUser } from '../application/use-cases/users/CreateUser';
import { LoginUser } from '../application/use-cases/users/LoginUser';
import { SetUserPassword } from '../application/use-cases/users/SetUserPassword';
import { UserController } from '../infrastructure/web/controllers/UserController';
import { GetUserList } from '../application/use-cases/users/GetUserList';

export interface Cradle {
    // use cases
    createUser: CreateUser;
    getUserList: GetUserList;
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
    createUser: asClass(CreateUser).singleton(),
    getUserList: asClass(GetUserList).singleton(),
    loginUser: asClass(LoginUser).singleton(),
    setUserPassword: asClass(SetUserPassword).singleton(),

    // repositories
    userRepository: asClass(UserRepository).singleton(),

    // controller
    userController: asClass(UserController).singleton(),

    // services
    encryptor: asClass(Encryptor).singleton(),
    uidGenerator: asClass(UIDGenerator).singleton(),
});
