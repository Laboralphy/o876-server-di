import { Cradle } from '../../boot/container';
import { AuthenticateUser } from '../../application/use-cases/users/AuthenticateUser';
import { debug } from '../../libs/o876-debug';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { GetUserBan } from '../../application/use-cases/users/GetUserBan';
import { ITime } from '../../application/ports/services/ITime';
import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import { User } from '../../domain/entities/User';
import { RunCommand } from '../../application/use-cases/commands/RunCommand';
import { ClientSession } from '../../domain/types/ClientSession';
import { RegisterClient } from '../../application/use-cases/clients/RegisterClient';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { CreateUser } from '../../application/use-cases/users/CreateUser';
import { IServerConfig } from '../../application/ports/services/IServerConfig';
import { CreateUserDto } from '../../application/dto/CreateUserDto';
import { FindUser } from '../../application/use-cases/users/FindUser';
import { JsonObject } from '../../domain/types/JsonStruct';
import { SetUserPassword } from '../../application/use-cases/user-secrets/SetUserPassword';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { id } from 'zod/locales';

const debugClient = debug('srv:client');

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export abstract class AbstractClientController {
    private readonly authenticateUser: AuthenticateUser;
    private readonly destroyClient: DestroyClient;
    private readonly communicationLayer: ICommunicationLayer;
    private readonly sendClientMessage: SendClientMessage;
    private readonly getUserBan: GetUserBan;
    private readonly time: ITime;
    private readonly runCommand: RunCommand;
    private readonly registerClient: RegisterClient;
    private readonly createUser: CreateUser;
    private readonly serverConfig: IServerConfig;
    private readonly findUser: FindUser;
    private readonly setUserPassword: SetUserPassword;

    constructor(cradle: Cradle) {
        this.authenticateUser = cradle.authenticateUser;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
        this.sendClientMessage = cradle.sendClientMessage;
        this.getUserBan = cradle.getUserBan;
        this.time = cradle.time;
        this.runCommand = cradle.runCommand;
        this.registerClient = cradle.registerClient;
        this.createUser = cradle.createUser;
        this.findUser = cradle.findUser;
        this.serverConfig = cradle.serverConfig;
        this.setUserPassword = cradle.setUserPassword;
    }

    getServerConfig(): IServerConfig {
        return this.serverConfig;
    }

    execCommand(idClient: string, sCommand: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        debugClient('%s > %s', csd.user?.name, sCommand);
        return this.runCommand.execute(csd, sCommand);
    }

    getAuthenticatedUser(idClient: string): User | null {
        const csd = this.communicationLayer.getClientSession(idClient);
        return csd.user;
    }

    getClientSession(idClient: string): ClientSession {
        return this.communicationLayer.getClientSession(idClient);
    }

    sendMessage(idClient: string, key: string, parameters?: JsonObject) {
        return this.sendClientMessage.execute(idClient, key, parameters);
    }

    send(idClient: string, message: string) {
        const csd = this.getClientSession(idClient);
        return csd.clientSocket.send(message);
    }

    /**
     * Pauses the promise for a certain amount of milliseconds
     * @param n number of milliseconds to wait
     * @param idClient client identifier
     */
    protected async pauseClient(idClient: string, n: number) {
        const csd = this.getClientSession(idClient);
        const nowState = csd.state;
        csd.state = CLIENT_STATES.PAUSE;
        const prom = new Promise<void>((resolve) => {
            setTimeout(resolve, n);
        });
        prom.finally(() => {
            const csd = this.getClientSession(idClient);
            if (csd.state == CLIENT_STATES.PAUSE) {
                csd.state = nowState;
            }
        });
        return prom;
    }

    /**
     * The client want to change its password
     * This works only when user instance exists in database
     * @param idClient
     * @param currentPassword
     * @param newPassword
     */
    async changePassword(
        idClient: string,
        newPassword: string,
        currentPassword: string
    ): Promise<boolean> {
        // get user associated with this client
        const csd = this.getClientSession(idClient);
        if (csd.user) {
            return this.setUserPassword.execute(csd.user.id, newPassword, currentPassword);
        } else {
            throw new Error('There is no user identity associated with this client');
        }
    }

    /**
     * Notify client state error on log
     * @param idClient client identifier
     * @param expectedState expected client state
     */
    notifyStateError(idClient: string, expectedState: CLIENT_STATES) {
        const csd = this.communicationLayer.getClientSession(idClient);
        debugClient(
            'client %s : Unexpected client state : %d ; expected %d',
            idClient,
            csd.state,
            expectedState
        );
    }

    async setLoginPassword(idClient: string, password: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        try {
            debugClient('client %s login as %s password : ********', idClient, csd.login);
            csd.user = await this.authenticateUser.execute(csd.login, password);
            const ban = await this.getUserBan.execute(csd.user.id);
            if (ban) {
                // this user is banned
                // send a notification
                await this.sendClientMessage.execute(idClient, 'user-banned', {
                    date: ban.forever ? null : this.time.renderDate(ban?.tsEnd, 'ymd hm'),
                    reason: ban.reason,
                });
                // print a debug line
                debugClient(
                    'user %s was banned on %s until %s because : `%s` - disconnecting user',
                    csd.user.name,
                    this.time.renderDate(ban.tsBegin, 'ymd'),
                    ban.forever ? 'the end of time' : this.time.renderDate(ban.tsEnd, 'ymd hm'),
                    ban.reason
                );
                // destroy client socket, then exit function
                csd.state = CLIENT_STATES.BANNED;
                return false;
            }
            csd.state = CLIENT_STATES.AUTHENTICATED;
            debugClient('client %s has been authenticated as user %s', idClient, csd.user.name);
            return true;
        } catch (e) {
            const error = e as Error;
            await this.pauseClient(idClient, 1500);
            debugClient('client %s authentication error: %s', idClient, error.message);
            csd.state = CLIENT_STATES.NONE;
            return false;
        }
    }

    async createNewAccount(idClient: string, accountCreation: CreateUserDto) {
        debugClient(
            'client : %s - creating new account : %s (%s)',
            idClient,
            accountCreation.name,
            accountCreation.displayName
        );
        const csd = this.communicationLayer.getClientSession(idClient);
        csd.user = await this.createUser.execute(accountCreation);
        return csd.user;
    }

    /**
     * Initialize client socket
     * - links the client socket to the communication layer
     * - handles several client socket events (message, close...)
     */
    initClientSession(
        idClient: string,
        clientSocket: IClientSocket,
        clientContext: IClientContext
    ): ClientSession {
        const clientSession = this.registerClient.execute(idClient, clientSocket, clientContext);

        clientSocket.onDisconnect(() => {
            debugClient('client %s disconnected', idClient);
            this.destroyClient.execute(idClient);
        });

        return clientSession;
    }

    findUserByName(name: string): Promise<User | undefined> {
        return this.findUser.execute({ name });
    }

    findUserByDisplayName(name: string): Promise<User | undefined> {
        return this.findUser.execute({ displayName: name });
    }

    /**
     * Called when the service is shutting down : disconnects all clients immediately
     */
    async expelClients() {
        debugClient('disconnecting all clients');
        this.communicationLayer.dropAllClients();
    }

    async dropClient(idClient: string) {
        await this.sendMessage(idClient, 'welcome.goodbye');
        await this.pauseClient(idClient, 250);
        return this.communicationLayer.dropClient(idClient);
    }

    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    abstract connect(socket: never): Promise<void>;

    abstract changePasswordProcess(clientSession: ClientSession, message?: string): Promise<void>;
}
