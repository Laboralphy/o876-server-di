import { createContainer, asClass } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/json-database/UserRepository';

import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';
import { JsonDatabase } from '../infrastructure/services/JsonDatabase';
import { TimeVanilla } from '../infrastructure/services/TimeVanilla';

import { ITime } from '../application/ports/services/ITime';
import { IEncryptor } from '../application/ports/services/IEncryptor';
import { IUIDGenerator } from '../application/ports/services/IUIDGenerator';

import { IUserRepository } from '../domain/ports/repositories/IUserRepository';
import { IUserSecretRepository } from '../domain/ports/repositories/IUserSecretRepository';
import { IClientRepository } from '../domain/ports/repositories/IClientRepository';

import { IDatabaseAdapter } from '../domain/ports/adapters/IDatabaseAdapter';

import { CreateUser } from '../application/use-cases/users/CreateUser';
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
import { ClientRepository } from '../infrastructure/persistance/in-memory/ClientRepository';
import { CreateClient } from '../application/use-cases/clients/CreateClient';
import { AuthenticateClient } from '../application/use-cases/clients/AuthenticateClient';
import { GetClient } from '../application/use-cases/clients/GetClient';
import { ICommunicationManager } from '../application/ports/services/ICommunicationManager';
import { CommunicationLayer } from '../infrastructure/services/CommunicationLayer';
import { DestroyClient } from '../application/use-cases/clients/DestroyClient';
import { IStringRepository } from '../application/ports/services/IStringRepository';
import { I18nRepository } from '../infrastructure/services/I18nRepository';
import { SendClientString } from '../application/use-cases/clients/SendClientString';
import { HbsTemplateRepository } from '../infrastructure/services/HbsTemplateRepository';
import { ITemplateRepository } from '../application/ports/services/ITemplateRepository';

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
    findUser: FindUser;
    deleteUser: DeleteUser;
    getUserBan: GetUserBan;
    getUser: GetUser;
    setUserPassword: SetUserPassword;
    banUser: BanUser;
    unbanUser: UnbanUser;
    // use cases clients
    createClient: CreateClient;
    authenticateClient: AuthenticateClient;
    getClient: GetClient;
    destroyClient: DestroyClient;
    sendClientString: SendClientString;

    // repositories
    userRepository: IUserRepository;
    userSecretRepository: IUserSecretRepository;
    clientRepository: IClientRepository;

    // controller
    apiUserController: ApiUserController;
    telnetClientController: TelnetClientController;

    // services
    encryptor: IEncryptor;
    uidGenerator: IUIDGenerator;
    database: IDatabaseAdapter;
    time: ITime;
    communicationLayer: ICommunicationManager;
    stringRepository: IStringRepository;
    templateRepository: ITemplateRepository;
}

// Container creation
export const container = createContainer<Cradle>();

// Registering dependencies
container.register({
    // use cases : users
    createUser: asClass(CreateUser).singleton(),
    modifyUser: asClass(ModifyUser).singleton(),
    getUserList: asClass(GetUserList).singleton(),
    findUser: asClass(FindUser).singleton(),
    deleteUser: asClass(DeleteUser).singleton(),
    getUserBan: asClass(GetUserBan).singleton(),
    getUser: asClass(GetUser).singleton(),
    setUserPassword: asClass(SetUserPassword).singleton(),
    banUser: asClass(BanUser).singleton(),
    unbanUser: asClass(UnbanUser).singleton(),
    // use cases : clients
    createClient: asClass(CreateClient).singleton(),
    authenticateClient: asClass(AuthenticateClient).singleton(),
    getClient: asClass(GetClient).singleton(),
    destroyClient: asClass(DestroyClient).singleton(),
    sendClientString: asClass(SendClientString).singleton(),

    // repositories
    userRepository: asClass(UserRepository).singleton(),
    userSecretRepository: asClass(UserSecretRepository).singleton(),
    clientRepository: asClass(ClientRepository).singleton(),

    // controllers : API
    apiUserController: asClass(ApiUserController).singleton(),
    // controllers : Telnet
    telnetClientController: asClass(TelnetClientController).singleton(),

    // services
    encryptor: asClass(Encryptor).singleton(),
    uidGenerator: asClass(UIDGenerator).singleton(),
    database: asClass(JsonDatabase).singleton(),
    time: asClass(TimeVanilla).singleton(),
    communicationLayer: asClass(CommunicationLayer).singleton(),
    stringRepository: asClass(I18nRepository).singleton(),
    templateRepository: asClass(HbsTemplateRepository).singleton(),
});
