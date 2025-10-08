import { Client as TelnetClient } from '../../../../@types/telnet2';
import { Cradle } from '../../../config/container';
import { CreateClient } from '../../../application/use-cases/clients/CreateClient';
import { CLIENT_PROTOCOL, CLIENT_STAGES } from '../../../domain/entities/Client';
import { AuthenticateClient } from '../../../application/use-cases/clients/AuthenticateClient';
import { printDbg } from '../../../libs/print-dbg';
import { ICommunicationManager } from '../../../application/ports/services/ICommunicationManager';
import { TelnetClientSocket } from '../../services/TelnetClientSocket';
import { DestroyClient } from '../../../application/use-cases/clients/DestroyClient';

const debugTelnet = printDbg('telnet');

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class ClientController {
    private readonly createClient: CreateClient;
    private readonly authenticateClient: AuthenticateClient;
    private readonly destroyClient: DestroyClient;
    private readonly communicationLayer: ICommunicationManager;

    constructor(cradle: Cradle) {
        this.createClient = cradle.createClient;
        this.authenticateClient = cradle.authenticateClient;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
    }
    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    async connect(socket: TelnetClient) {
        // create client
        const clientSocket = new TelnetClientSocket(socket);
        const domainClient = await this.createClient.execute(clientSocket, CLIENT_PROTOCOL.TELNET);
        const idClient = domainClient.id;
        debugTelnet('client %s connexion', idClient);

        this.communicationLayer.linkClientSocket(idClient, clientSocket);
        clientSocket.onDisconnect(async () => {
            debugTelnet('client %s disconnected', idClient);
            await this.destroyClient.execute(idClient);
        });

        clientSocket.onMessage(async (message: string) => {
            // in telnet
            // the first two messages are used to receive credentials
            // the subsequent messages must be parsed
            const csd = this.communicationLayer.getClientSession(idClient);
            if (!csd) {
                debugTelnet(
                    'client %s message discarded (invalid session - this case should not happen)',
                    idClient
                );
                clientSocket.close();
                return;
            }
            if (domainClient.stage === CLIENT_STAGES.AUTHENTICATED) {
                // here the message should be interpreted as a command
                debugTelnet('user %s : %s', csd.login, message);
            } else if (csd.login !== '') {
                // here the message should be a password
                debugTelnet('client %s sending password', idClient);
                try {
                    const client = await this.authenticateClient.execute(
                        idClient,
                        csd.login,
                        message
                    );
                    csd.user = client.user ?? '';
                    if (client.stage === CLIENT_STAGES.BANNED) {
                    }
                    debugTelnet('client %s is now authenticated as user', csd.user);
                } catch (e) {
                    const error = e as Error;
                    debugTelnet('client %s authentication error: %s', idClient, error.message);
                    clientSocket.close();
                }
            } else {
                csd.login = message;
                debugTelnet('client %s sending login : %s', idClient, csd.login);
            }
        });
    }

    /**
     * Called when the service is shutting down
     */
    async expelClients() {
        debugTelnet('disconnecting all clients');
        this.communicationLayer.dropAllClients();
    }
}
