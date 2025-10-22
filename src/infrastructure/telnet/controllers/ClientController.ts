import { Client as TelnetClient } from '../../../../@types/telnet2';
import { Cradle } from '../../../config/container';
import { AuthenticateUser } from '../../../application/use-cases/users/AuthenticateUser';
import { debuglog as debug } from 'node:util';
import { ICommunicationLayer } from '../../../application/ports/services/ICommunicationLayer';
import { TelnetClientSocket } from '../../services/TelnetClientSocket';
import { DestroyClient } from '../../../application/use-cases/clients/DestroyClient';
import { SendClientMessage } from '../../../application/use-cases/clients/SendClientMessage';
import { GetUserBan } from '../../../application/use-cases/users/GetUserBan';
import { ITime } from '../../../application/ports/services/ITime';
import { IUIDGenerator } from '../../../application/ports/services/IUIDGenerator';

const debugTelnet = debug('telnet');

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class ClientController {
    private readonly authenticateUser: AuthenticateUser;
    private readonly destroyClient: DestroyClient;
    private readonly communicationLayer: ICommunicationLayer;
    private readonly sendClientString: SendClientMessage;
    private readonly getUserBan: GetUserBan;
    private readonly time: ITime;
    private readonly uidGenerator: IUIDGenerator;

    constructor(cradle: Cradle) {
        this.authenticateUser = cradle.authenticateUser;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
        this.sendClientString = cradle.sendClientMessage;
        this.getUserBan = cradle.getUserBan;
        this.time = cradle.time;
        this.uidGenerator = cradle.uidGenerator;
    }
    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    async connect(socket: TelnetClient) {
        const clientSocket = new TelnetClientSocket(socket);
        // create new client session
        const idClient = this.uidGenerator.getUID();
        debugTelnet('client %s connexion', idClient);

        this.communicationLayer.linkClientSocket(idClient, clientSocket);
        clientSocket.onDisconnect(async () => {
            debugTelnet('client %s disconnected', idClient);
            await this.destroyClient.execute(idClient);
        });

        await this.sendClientString.execute(idClient, 'welcome.login', { _nolf: true });
        clientSocket.onMessage(async (message: string) => {
            // in telnet
            // the first two messages are used to receive credentials
            // the subsequent messages must be parsed
            const csd = this.communicationLayer.getClientSession(idClient);
            if (csd.user) {
                // here the message should be interpreted as a command
            } else if (csd.login !== '') {
                // here the message should be a password
                await csd.clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])); // Réactive l'écho (DONT WONT ECHO)
                await csd.clientSocket.send('\n');
                debugTelnet('client %s sending password', idClient);
                try {
                    csd.user = await this.authenticateUser.execute(csd.login, message);
                    const ban = await this.getUserBan.execute(csd.user.id);
                    if (ban) {
                        // this user is banned
                        // send a notification
                        await this.sendClientString.execute(idClient, 'user-banned', {
                            date: this.time.renderDate(ban?.tsEnd, 'ymd hm'),
                            reason: ban.reason,
                        });
                        // print a debug line
                        debugTelnet(
                            'user %s was banned on %s until %s because : `%s` - disconnecting user',
                            csd.user.name,
                            this.time.renderDate(ban.tsBegin, 'ymd'),
                            ban.forever
                                ? 'the end of time'
                                : this.time.renderDate(ban.tsEnd, 'ymd hm'),
                            ban.reason
                        );
                        // destroy client socket, then exit function
                        await this.destroyClient.execute(idClient);
                        return;
                    }
                    debugTelnet(
                        'client %s has been authenticated as user %s',
                        idClient,
                        csd.user.name
                    );
                } catch (e) {
                    const error = e as Error;
                    debugTelnet('client %s authentication error: %s', idClient, error.message);
                    clientSocket.close();
                }
            } else {
                // here the message should be a user login name
                csd.login = message;
                await this.sendClientString.execute(idClient, 'welcome.password', { _nolf: true });
                await csd.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // Désactive l'écho (DO WONT ECHO)
                debugTelnet('client %s sending login : %s', idClient, csd.login);
            }
        });
    }

    /**
     * Called when the service is shutting down : disconnects all clients immediately
     */
    async expelClients() {
        debugTelnet('disconnecting all clients');
        this.communicationLayer.dropAllClients();
    }
}
