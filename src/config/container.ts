import { createContainer, asClass } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/json-database/UserRepository';
import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';
import { CreateUser } from '../application/use-cases/users/CreateUser';
import { LoginUser } from '../application/use-cases/users/LoginUser';
import { UserController } from '../infrastructure/web/controllers/UserController';
import { GetUserList } from '../application/use-cases/users/GetUserList';
import { IDatabaseAdapter } from '../domain/ports/IDatabaseAdapter';
import { JsonDatabase } from '../infrastructure/services/JsonDatabase';
import { ModifyUser } from '../application/use-cases/users/ModifyUser';

export interface Cradle {
    // use cases
    createUser: CreateUser;
    modifyUser: ModifyUser;
    getUserList: GetUserList;
    loginUser: LoginUser;

    // repositories
    userRepository: UserRepository;

    // controller
    userController: UserController;

    // services
    encryptor: Encryptor;
    uidGenerator: UIDGenerator;
    database: IDatabaseAdapter;
}

// Container creation
export const container = createContainer<Cradle>();

// Registering dependencies
container.register({
    // use cases
    createUser: asClass(CreateUser).singleton(),
    modifyUser: asClass(ModifyUser).singleton(),
    getUserList: asClass(GetUserList).singleton(),
    loginUser: asClass(LoginUser).singleton(),

    // repositories
    userRepository: asClass(UserRepository).singleton(),

    // controller
    userController: asClass(UserController).singleton(),

    // services
    encryptor: asClass(Encryptor).singleton(),
    uidGenerator: asClass(UIDGenerator).singleton(),
    database: asClass(JsonDatabase).singleton(),
});
