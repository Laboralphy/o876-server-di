import { Cradle } from '../../config/container';
import { AuthenticateUser } from '../../application/use-cases/users/AuthenticateUser';
import { debug } from '../../libs/o876-debug';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { GetUserBan } from '../../application/use-cases/users/GetUserBan';
import { ITime } from '../../application/ports/services/ITime';
import { IUIDGenerator } from '../../application/ports/services/IUIDGenerator';
import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import { User } from '../../domain/entities/User';
import { JsonObject } from '../../domain/types/JsonStruct';
import { RunCommand } from '../../application/use-cases/commands/RunCommand';

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
    private readonly uidGenerator: IUIDGenerator;
    private readonly runCommand: RunCommand;

    constructor(cradle: Cradle) {
        this.authenticateUser = cradle.authenticateUser;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
        this.sendClientMessage = cradle.sendClientMessage;
        this.getUserBan = cradle.getUserBan;
        this.time = cradle.time;
        this.uidGenerator = cradle.uidGenerator;
        this.runCommand = cradle.runCommand;
    }

    execCommand(idClient: string, sCommand: string) {
        return this.runCommand.execute(idClient, sCommand);
    }

    sendMessage(idClient: string, key: string, parameters: JsonObject) {
        return this.sendClientMessage.execute(idClient, key, parameters);
    }

    getAuthenticatedUser(idClient: string): User | null {
        const csd = this.communicationLayer.getClientSession(idClient);
        return csd.user;
    }

    getLogin(idClient: string): string {
        const csd = this.communicationLayer.getClientSession(idClient);
        return csd.login ?? '';
    }

    getNewClientId() {
        return this.uidGenerator.getUID();
    }

    async setLogin(clientSocket: IClientSocket, login: string) {
        const idClient = clientSocket.id;
        const csd = this.communicationLayer.getClientSession(idClient);
        csd.login = login;
        debugClient('client %s login : %s', idClient, login);
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

    async setPassword(clientSocket: IClientSocket, password: string) {
        const idClient = clientSocket.id;
        debugClient('client %s password : ********', idClient);
        try {
            const csd = this.communicationLayer.getClientSession(idClient);
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
            clientSocket.close();
        }
    }

    /**
     * Initialize client socket
     * - links the client socket to the communication layer
     * - handles several client socket events (message, close...)
     * @param clientSocket
     */
    initClientSocket(clientSocket: IClientSocket) {
        const idClient = clientSocket.id;
        debugClient('client %s connexion', idClient);
        if (!idClient) {
            throw new Error('client socket must have non null id');
        }
        this.communicationLayer.linkClientSocket(clientSocket);
        clientSocket.onDisconnect(() => {
            debugClient('client %s disconnected', idClient);
            this.destroyClient.execute(idClient);
        });
        //
        // clientSocket.onMessage(async (message: string) => {
        //     // in telnet
        //     // the first two messages are used to receive credentials
        //     // the subsequent messages must be parsed
        //     const csd = this.communicationLayer.getClientSession(idClient);
        //     if (csd.user) {
        //         // here the message should be interpreted as a command
        //     } else if (csd.login !== '') {
        //         // here the message should be a password
        //         await csd.clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])); // Réactive l'écho (DONT WONT ECHO)
        //         await csd.clientSocket.send('\n');
        //     } else {
        //         // here the message should be a user login name
        //         csd.login = message;
        //         await this.sendClientMessage.execute(idClient, 'welcome.password', { _nolf: true });
        //         await csd.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // Désactive l'écho (DO WONT ECHO)
        //         debugClient('client %s sending login : %s', idClient, csd.login);
        //     }
        // });
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
