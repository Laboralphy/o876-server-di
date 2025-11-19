import { createContainer, asClass, asValue } from 'awilix';
import { UserRepository } from '../infrastructure/persistance/json-database/UserRepository';

import { Encryptor } from '../infrastructure/services/Encryptor';
import { UIDGenerator } from '../infrastructure/services/UIDGenerator';
import { JsonDatabase } from '../infrastructure/services/JsonDatabase';
import { TimeVanilla } from '../infrastructure/services/TimeVanilla';

import { ITime } from '../application/ports/services/ITime';
import { IEncryptor } from '../application/ports/services/IEncryptor';
import { IIdGenerator } from '../application/ports/services/IIdGenerator';

import { IUserRepository } from '../domain/ports/repositories/IUserRepository';
import { IUserSecretRepository } from '../domain/ports/repositories/IUserSecretRepository';

import { IDatabaseAdapter } from '../domain/ports/adapters/IDatabaseAdapter';

import { CreateUser } from '../application/use-cases/users/CreateUser';
import { GetUserList } from '../application/use-cases/users/GetUserList';
import { ModifyUser } from '../application/use-cases/users/ModifyUser';
import { FindUser } from '../application/use-cases/users/FindUser';
import { DeleteUser } from '../application/use-cases/users/DeleteUser';
import { GetUserBan } from '../application/use-cases/users/GetUserBan';
import { SetUserPassword } from '../application/use-cases/user-secrets/SetUserPassword';
import { GetUser } from '../application/use-cases/users/GetUser';
import { BanUser } from '../application/use-cases/users/BanUser';
import { UnbanUser } from '../application/use-cases/users/UnbanUser';

import { UserController as ApiUserController } from '../infrastructure/web/controllers/UserController';
import { TelnetClientController as TelnetClientController } from '../infrastructure/controllers/TelnetClientController';

import { UserSecretRepository } from '../infrastructure/persistance/json-database/UserSecretRepository';
import { AuthenticateUser } from '../application/use-cases/users/AuthenticateUser';
import { ICommunicationLayer } from '../application/ports/services/ICommunicationLayer';
import { CommunicationLayer } from '../infrastructure/services/CommunicationLayer';
import { DestroyClient } from '../application/use-cases/clients/DestroyClient';
import { IStringRepository } from '../application/ports/services/IStringRepository';
import { I18nRepository } from '../infrastructure/services/I18nRepository';
import { SendClientMessage } from '../application/use-cases/clients/SendClientMessage';
import { HbsTemplateRepository } from '../infrastructure/services/HbsTemplateRepository';
import { ITemplateRepository } from '../application/ports/services/ITemplateRepository';
import { ScriptRunner } from '../infrastructure/services/ScriptRunner';
import { ModuleManager } from '../infrastructure/services/ModuleManager';
import { RunCommand } from '../application/use-cases/commands/RunCommand';
import { CreateClientSession } from '../application/use-cases/clients/CreateClientSession';
import { IServerConfig } from '../application/ports/services/IServerConfig';
import { IScriptRunner } from '../application/ports/services/IScriptRunner';
import { IModuleManager } from '../application/ports/services/IModuleManager';
import { ServerConfig } from '../infrastructure/services/ServerConfig';
import { MailInboxRepository } from '../infrastructure/persistance/json-database/MailInboxRepository';
import { MailMessageRepository } from '../infrastructure/persistance/json-database/MailMessageRepository';
import { AddUserRoles } from '../application/use-cases/users/AddUserRoles';
import { RemoveUserRoles } from '../application/use-cases/users/RemoveUserRoles';
import { jsonDatabaseStructure, JsonDatabaseStructure } from './json-database-structure';
import { IApiContextBuilder } from '../application/ports/services/IApiContextBuilder';
import { ApiContextBuilder } from '../infrastructure/services/ApiContextBuilder';
import { CheckMailInbox } from '../application/use-cases/mail/CheckMailInbox';
import { SendMailMessage } from '../application/use-cases/mail/SendMailMessage';

/**
 * To as a new use case, port ...,
 * Update interface Cradle : add a new property with the same type as the new class
 * Update container.register : add a new property as class singleton
 */

export interface Cradle {
    // use cases
    // use case user secret
    setUserPassword: SetUserPassword;

    // use cases
    createUser: CreateUser;
    modifyUser: ModifyUser;
    getUserList: GetUserList;
    findUser: FindUser;
    deleteUser: DeleteUser;
    getUserBan: GetUserBan;
    getUser: GetUser;
    banUser: BanUser;
    unbanUser: UnbanUser;
    addUserRoles: AddUserRoles;
    removeUserRoles: RemoveUserRoles;
    // use cases clients
    authenticateUser: AuthenticateUser;
    destroyClient: DestroyClient;
    sendClientMessage: SendClientMessage;
    createClientSession: CreateClientSession;
    // use cases command
    runCommand: RunCommand;
    // use cases mail
    checkMailInbox: CheckMailInbox;
    sendMailMessage: SendMailMessage;

    // repositories
    userRepository: IUserRepository;
    userSecretRepository: IUserSecretRepository;
    mailInboxRepository: MailInboxRepository;
    mailMessageRepository: MailMessageRepository;

    // controller
    apiUserController: ApiUserController;
    telnetClientController: TelnetClientController;

    // services
    encryptor: IEncryptor;
    idGenerator: IIdGenerator;
    database: IDatabaseAdapter;
    time: ITime;
    communicationLayer: ICommunicationLayer;
    stringRepository: IStringRepository;
    templateRepository: ITemplateRepository;
    scriptRunner: IScriptRunner;
    moduleManager: IModuleManager;
    serverConfig: IServerConfig;
    // Api Context
    apiContextBuilder: IApiContextBuilder;

    // values
    jsonDatabaseStructure: JsonDatabaseStructure;
}
// Container creation
export const container = createContainer<Cradle>();

// Registering dependencies
container.register({
    // use cases : user secret
    setUserPassword: asClass(SetUserPassword).singleton(),
    // use cases : users
    createUser: asClass(CreateUser).singleton(),
    modifyUser: asClass(ModifyUser).singleton(),
    getUserList: asClass(GetUserList).singleton(),
    findUser: asClass(FindUser).singleton(),
    deleteUser: asClass(DeleteUser).singleton(),
    getUserBan: asClass(GetUserBan).singleton(),
    getUser: asClass(GetUser).singleton(),
    banUser: asClass(BanUser).singleton(),
    unbanUser: asClass(UnbanUser).singleton(),
    authenticateUser: asClass(AuthenticateUser).singleton(),
    addUserRoles: asClass(AddUserRoles).singleton(),
    removeUserRoles: asClass(RemoveUserRoles).singleton(),

    // use cases : clients
    destroyClient: asClass(DestroyClient).singleton(),
    sendClientMessage: asClass(SendClientMessage).singleton(),
    createClientSession: asClass(CreateClientSession).singleton(),

    // use cases : commands
    runCommand: asClass(RunCommand).singleton(),

    // use cases : mail
    checkMailInbox: asClass(CheckMailInbox).singleton(),
    sendMailMessage: asClass(SendMailMessage).singleton(),

    // repositories
    userRepository: asClass(UserRepository).singleton(),
    userSecretRepository: asClass(UserSecretRepository).singleton(),
    mailInboxRepository: asClass(MailInboxRepository).singleton(),
    mailMessageRepository: asClass(MailMessageRepository).singleton(),

    // controllers : API
    apiUserController: asClass(ApiUserController).singleton(),
    // controllers : Telnet
    telnetClientController: asClass(TelnetClientController).singleton(),

    // services
    encryptor: asClass(Encryptor).singleton(),
    idGenerator: asClass(UIDGenerator).singleton(),
    database: asClass(JsonDatabase).singleton(),
    time: asClass(TimeVanilla).singleton(),
    communicationLayer: asClass(CommunicationLayer).singleton(),
    stringRepository: asClass(I18nRepository).singleton(),
    templateRepository: asClass(HbsTemplateRepository).singleton(),
    scriptRunner: asClass(ScriptRunner).singleton(),
    moduleManager: asClass(ModuleManager).singleton(),
    serverConfig: asClass(ServerConfig).singleton(),
    apiContextBuilder: asClass(ApiContextBuilder).singleton(),

    // values
    jsonDatabaseStructure: asValue(jsonDatabaseStructure),
});
