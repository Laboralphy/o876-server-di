import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
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
import { RegisterClient } from '../application/use-cases/clients/RegisterClient';
import { IServerConfig } from '../application/ports/services/IServerConfig';
import { IScriptRunner } from '../application/ports/services/IScriptRunner';
import { IModuleManager } from '../application/ports/services/IModuleManager';
import { ServerConfig } from '../infrastructure/services/ServerConfig';
import { MailMessageRepository } from '../infrastructure/persistance/json-database/MailMessageRepository';
import { jsonDatabaseStructure, JsonDatabaseStructure } from './json-database-structure';
import { IApiContextBuilder } from '../application/ports/services/IApiContextBuilder';
import { ApiContextBuilder } from '../infrastructure/services/ApiContextBuilder';
import { SendMail } from '../application/use-cases/mail/SendMail';
import { MailContextService } from '../infrastructure/services/context-services/MailContextService';
import { UserContextService } from '../infrastructure/services/context-services/UserContextService';
import { ReadMail } from '../application/use-cases/mail/ReadMail';
import { SendUserMessage } from '../application/use-cases/users/SendUserMessage';
import { ChatManager } from '../infrastructure/services/ChatManager';
import { IChatManager } from '../application/ports/services/IChatManager';
import { ChatJoinChannel } from '../application/use-cases/chat/ChatJoinChannel';
import { ChatPostMessage } from '../application/use-cases/chat/ChatPostMessage';
import { ChatContextService } from '../infrastructure/services/context-services/ChatContextService';
import { ChatGetChannels } from '../application/use-cases/chat/ChatGetChannels';
import { TimeContextService } from '../infrastructure/services/context-services/TimeContextService';
import { IGMCPGateway } from '../application/ports/services/IGMCPGateway';
import { GMCPGateway } from '../infrastructure/services/GMCPGateway';
import { GmcpContextService } from '../infrastructure/services/context-services/GmcpContextService';
import { RunGMCPCommand } from '../application/use-cases/commands/RunGMCPCommand';
import { ListMail } from '../application/use-cases/mail/ListMail';
import { RunUserEvent } from '../application/use-cases/commands/RunUserEvent';

/**
 * To as a new use case, port ...,
 * Update interface Cradle : add a new property with the same type as the new class
 * Update container.register : add a new property as class singleton
 */

export interface Cradle {
    // use cases

    // chat manager use cases
    chatJoinChannel: ChatJoinChannel;
    chatPostMessage: ChatPostMessage;
    chatGetChannels: ChatGetChannels;

    // use case user secret
    setUserPassword: SetUserPassword;

    // use cases : users
    createUser: CreateUser;
    modifyUser: ModifyUser;
    getUserList: GetUserList;
    findUser: FindUser;
    deleteUser: DeleteUser;
    getUserBan: GetUserBan;
    getUser: GetUser;
    banUser: BanUser;
    unbanUser: UnbanUser;
    sendUserMessage: SendUserMessage;

    // use cases : clients
    authenticateUser: AuthenticateUser;
    destroyClient: DestroyClient;
    sendClientMessage: SendClientMessage;
    registerClient: RegisterClient;

    // use cases : command
    runCommand: RunCommand;
    runGMCPCommand: RunGMCPCommand;
    runUserEvent: RunUserEvent;

    // use cases : mail
    sendMail: SendMail;
    readMail: ReadMail;
    listMail: ListMail;

    // repositories
    userRepository: IUserRepository;
    userSecretRepository: IUserSecretRepository;
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
    chatManager: IChatManager;
    gmcpGateway: IGMCPGateway;

    // Api Context
    apiContextBuilder: IApiContextBuilder;

    // values
    jsonDatabaseStructure: JsonDatabaseStructure;

    // Api context services
    mailContextService: MailContextService;
    userContextService: UserContextService;
    chatContextService: ChatContextService;
    timeContextService: TimeContextService;
    gmcpContextService: GmcpContextService;
}
// Container creation
export const container = createContainer<Cradle>();

// Registering dependencies
container.register({
    // use cases : chat manager
    chatJoinChannel: asClass(ChatJoinChannel).singleton(),
    chatPostMessage: asClass(ChatPostMessage).singleton(),
    chatGetChannels: asClass(ChatGetChannels).singleton(),

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
    sendUserMessage: asClass(SendUserMessage).singleton(),

    // use cases : clients
    destroyClient: asClass(DestroyClient).singleton(),
    sendClientMessage: asClass(SendClientMessage).singleton(),
    registerClient: asClass(RegisterClient).singleton(),

    // use cases : commands
    runCommand: asClass(RunCommand).singleton(),
    runGMCPCommand: asClass(RunGMCPCommand).singleton(),
    runUserEvent: asClass(RunUserEvent).singleton(),

    // use cases : mail
    sendMail: asClass(SendMail).singleton(),
    readMail: asClass(ReadMail).singleton(),
    listMail: asClass(ListMail).singleton(),

    // repositories
    userRepository: asClass(UserRepository).singleton(),
    userSecretRepository: asClass(UserSecretRepository).singleton(),
    mailMessageRepository: asClass(MailMessageRepository).singleton(),

    // controllers : API
    apiUserController: asClass(ApiUserController).singleton(),

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
    chatManager: asClass(ChatManager).singleton(),
    gmcpGateway: asClass(GMCPGateway).singleton(),

    // values
    jsonDatabaseStructure: asValue(jsonDatabaseStructure),

    /****** CLIENT SCOPED ****** CLIENT SCOPED ****** CLIENT SCOPED ****** CLIENT SCOPED ******/
    /****** CLIENT SCOPED ****** CLIENT SCOPED ****** CLIENT SCOPED ****** CLIENT SCOPED ******/
    /****** CLIENT SCOPED ****** CLIENT SCOPED ****** CLIENT SCOPED ****** CLIENT SCOPED ******/
    apiContextBuilder: asClass(ApiContextBuilder).scoped(),

    // controllers : Telnet
    telnetClientController: asClass(TelnetClientController).scoped(),

    // Api context services
    mailContextService: asClass(MailContextService).scoped(),
    userContextService: asClass(UserContextService).scoped(),
    chatContextService: asClass(ChatContextService).scoped(),
    timeContextService: asClass(TimeContextService).scoped(),
    gmcpContextService: asClass(GmcpContextService).scoped(),
});

/**
 * This is the same cradle as above but dedicated to a specific client
 */
export interface ClientCradle extends Cradle {
    idClient: string;
}

export function createClientContainer(idClient: string): AwilixContainer<ClientCradle> {
    const c = container.createScope<ClientCradle>();
    c.register('idClient', asValue(idClient));
    return c;
}
