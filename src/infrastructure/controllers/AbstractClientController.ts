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
import { CreateClientSession } from '../../application/use-cases/clients/CreateClientSession';
import { CLIENT_STATE } from '../../domain/enums';
import { CreateUser } from '../../application/use-cases/users/CreateUser';

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
    private readonly createClientSession: CreateClientSession;
    private readonly createUser: CreateUser;

    constructor(cradle: Cradle) {
        this.authenticateUser = cradle.authenticateUser;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
        this.sendClientMessage = cradle.sendClientMessage;
        this.getUserBan = cradle.getUserBan;
        this.time = cradle.time;
        this.runCommand = cradle.runCommand;
        this.createClientSession = cradle.createClientSession;
        this.createUser = cradle.createUser;
    }

    execCommand(idClient: string, sCommand: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        return this.runCommand.execute(csd, sCommand);
    }

    getAuthenticatedUser(idClient: string): User | null {
        const csd = this.communicationLayer.getClientSession(idClient);
        return csd.user;
    }

    getLogin(idClient: string): string {
        const csd = this.communicationLayer.getClientSession(idClient);
        return csd.login ?? '';
    }

    /**
     * Pauses the promise for a certain amount of milliseconds
     * @param n number of milliseconds to wait
     */
    protected async pause(n: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, n);
        });
    }

    /**
     * Notify client state error on log
     * @param idClient client identifier
     * @param expectedState expected client state
     */
    notifyStateError(idClient: string, expectedState: CLIENT_STATE) {
        const csd = this.communicationLayer.getClientSession(idClient);
        debugClient(
            'client %s : Unexpected client state : %d ; expected %d',
            idClient,
            csd.state,
            expectedState
        );
    }

    async setLoginUsername(idClient: string, username: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        if (csd.state == CLIENT_STATE.LOGIN_PROMPT_USERNAME) {
            csd.login = username;
            debugClient('client %s login : %s', idClient, username);
            csd.state = CLIENT_STATE.LOGIN_PROMPT_PASSWORD;
        } else {
            this.notifyStateError(idClient, CLIENT_STATE.LOGIN_PROMPT_USERNAME);
        }
    }

    async setLoginPassword(idClient: string, password: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        if (csd.state != CLIENT_STATE.LOGIN_PROMPT_PASSWORD) {
            this.notifyStateError(idClient, CLIENT_STATE.LOGIN_PROMPT_PASSWORD);
            return;
        }
        try {
            debugClient('client %s password : ********', idClient);
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
                this.destroyClient.execute(idClient);
                return;
            }
            await this.pause(500);
            debugClient('client %s has been authenticated as user %s', idClient, csd.user.name);
        } catch (e) {
            const error = e as Error;
            await this.pause(1500);
            debugClient('client %s authentication error: %s', idClient, error.message);
            this.communicationLayer.dropClient(idClient);
        }
    }

    async createAccountUserName(idClient: string, username: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        if (csd.state != CLIENT_STATE.CREATE_ACCOUNT_PROMPT_USERNAME) {
            this.notifyStateError(idClient, CLIENT_STATE.CREATE_ACCOUNT_PROMPT_USERNAME);
            return;
        }
        csd.login = username;
        csd.state = CLIENT_STATE.CREATE_ACCOUNT_PROMPT_PASSWORD;
    }

    async createAccountPassword(idClient: string, password: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        if (csd.state != CLIENT_STATE.CREATE_ACCOUNT_PROMPT_PASSWORD) {
            this.notifyStateError(idClient, CLIENT_STATE.CREATE_ACCOUNT_PROMPT_PASSWORD);
            return;
        }
        csd.tmpPass = password;
        csd.state = CLIENT_STATE.CREATE_ACCOUNT_PROMPT_CONFIRM_PASSWORD;
    }

    /**
     * Called at account creation : checks if password if confirmed
     * @param idClient
     * @param password
     */
    async createAccountConfirmPassword(idClient: string, password: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        if (csd.state != CLIENT_STATE.CREATE_ACCOUNT_PROMPT_CONFIRM_PASSWORD) {
            this.notifyStateError(idClient, CLIENT_STATE.CREATE_ACCOUNT_PROMPT_CONFIRM_PASSWORD);
            return false;
        }
        if (csd.tmpPass == password) {
            // The password was confirmed
            csd.state = CLIENT_STATE.CREATE_ACCOUNT_PROMPT_MAIL;
            return true;
        } else {
            // The password was not confirmed
            return false;
        }
    }

    async createAccountEmail(idClient: string, email: string) {
        const csd = this.communicationLayer.getClientSession(idClient);
        if (csd.state != CLIENT_STATE.CREATE_ACCOUNT_PROMPT_MAIL) {
            this.notifyStateError(idClient, CLIENT_STATE.CREATE_ACCOUNT_PROMPT_MAIL);
            return false;
        }
        const payload = {
            name: csd.login,
            password: csd.tmpPass,
            email,
        };
        const user = await this.createUser.execute(payload);
        csd.user = user;
    }

    /**
     * Initialize client socket
     * - links the client socket to the communication layer
     * - handles several client socket events (message, close...)
     * @param clientSocket
     */
    initClientSession(clientSocket: IClientSocket): ClientSession {
        const clientSession = this.createClientSession.execute(clientSocket);
        const idClient = clientSession.id;

        clientSocket.onDisconnect(() => {
            debugClient('client %s disconnected', idClient);
            this.destroyClient.execute(idClient);
        });

        return clientSession;
    }

    /**
     * Called when the service is shutting down : disconnects all clients immediately
     */
    async expelClients() {
        debugClient('disconnecting all clients');
        this.communicationLayer.dropAllClients();
    }

    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    abstract connect(socket: never): Promise<void>;
}
