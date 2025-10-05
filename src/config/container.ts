import { createContainer, asClass } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/json-database/UserRepository';

import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';
import { JsonDatabase } from '../infrastructure/services/JsonDatabase';
import { TimeVanilla } from '../infrastructure/services/TimeVanilla';

import { ITime } from '../application/ports/services/ITime';
import { IEncryptor } from '../application/ports/services/IEncryptor';
import { IUIDGenerator } from '../application/ports/services/IUIDGenerator';

import { IUserRepository } from '../application/ports/repositories/IUserRepository';
import { IUserSecretRepository } from '../application/ports/repositories/IUserSecretRepository';

import { IDatabaseAdapter } from '../domain/ports/IDatabaseAdapter';

import { CreateUser } from '../application/use-cases/users/CreateUser';
import { LoginUser } from '../application/use-cases/users/LoginUser';
import { GetUserList } from '../application/use-cases/users/GetUserList';
import { ModifyUser } from '../application/use-cases/users/ModifyUser';
import { FindUser } from '../application/use-cases/users/FindUser';
import { DeleteUser } from '../application/use-cases/users/DeleteUser';
import { GetUserBan } from '../application/use-cases/users/GetUserBan';
import { SetUserPassword } from '../application/use-cases/users/SetUserPassword';
import { GetUser } from '../application/use-cases/users/GetUser';
import { BanUser } from '../application/use-cases/users/BanUser';
import { UnbanUser } from '../application/use-cases/users/UnbanUser';

import { UserController as ApiUserController } from '../infrastructure/web/controllers/UserController';
import { ClientController as TelnetClientController } from '../infrastructure/telnet/controllers/ClientController';

import { UserSecretRepository } from '../infrastructure/persistance/json-database/UserSecretRepository';

/**
 * To as a new use case, port ...,
 * Update interface Cradle : add a new property with the same type as the new class
 * Update container.register : add a new property as class singleton
 */

export interface Cradle {
    // use cases
    createUser: CreateUser;
    modifyUser: ModifyUser;
    getUserList: GetUserList;
    loginUser: LoginUser;
    findUser: FindUser;
    deleteUser: DeleteUser;
    getUserBan: GetUserBan;
    getUser: GetUser;
    setUserPassword: SetUserPassword;
    banUser: BanUser;
    unbanUser: UnbanUser;

    // repositories
    userRepository: IUserRepository;
    userSecretRepository: IUserSecretRepository;

    // controller
    apiUserController: ApiUserController;
    telnetClientController: TelnetClientController;

    // services
    encryptor: IEncryptor;
    uidGenerator: IUIDGenerator;
    database: IDatabaseAdapter;
    time: ITime;
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
    findUser: asClass(FindUser).singleton(),
    deleteUser: asClass(DeleteUser).singleton(),
    getUserBan: asClass(GetUserBan).singleton(),
    getUser: asClass(GetUser).singleton(),
    setUserPassword: asClass(SetUserPassword).singleton(),
    banUser: asClass(BanUser).singleton(),
    unbanUser: asClass(UnbanUser).singleton(),

    // repositories
    userRepository: asClass(UserRepository).singleton(),
    userSecretRepository: asClass(UserSecretRepository).singleton(),

    // controllers : API
    apiUserController: asClass(ApiUserController).singleton(),
    // controllers : Telnet
    telnetClientController: asClass(TelnetClientController).singleton(),

    // services
    encryptor: asClass(Encryptor).singleton(),
    uidGenerator: asClass(UIDGenerator).singleton(),
    database: asClass(JsonDatabase).singleton(),
    time: asClass(TimeVanilla).singleton(),
});
