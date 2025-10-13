import { Client as TelnetClient } from '../../../../@types/telnet2';
import { Cradle } from '../../../config/container';
import { CreateClient } from '../../../application/use-cases/clients/CreateClient';
import { CLIENT_PROTOCOL, CLIENT_STAGES } from '../../../domain/entities/Client';
import { AuthenticateClient } from '../../../application/use-cases/clients/AuthenticateClient';
import { printDbg } from '../../../libs/print-dbg';
import { ICommunicationManager } from '../../../application/ports/services/ICommunicationManager';
import { TelnetClientSocket } from '../../services/TelnetClientSocket';
import { DestroyClient } from '../../../application/use-cases/clients/DestroyClient';
import { GetClient } from '../../../application/use-cases/clients/GetClient';
import { SendClientString } from '../../../application/use-cases/clients/SendClientString';

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
    private readonly getClient: GetClient;
    private readonly sendClientString: SendClientString;

    constructor(cradle: Cradle) {
        this.createClient = cradle.createClient;
        this.authenticateClient = cradle.authenticateClient;
        this.destroyClient = cradle.destroyClient;
        this.communicationLayer = cradle.communicationLayer;
        this.getClient = cradle.getClient;
        this.sendClientString = cradle.sendClientString;
    }
    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    async connect(socket: TelnetClient) {
        const clientSocket = new TelnetClientSocket(socket);
        // create new client
        const domainClient = await this.createClient.execute(clientSocket, CLIENT_PROTOCOL.TELNET);
        const idClient = domainClient.id;
        debugTelnet('client %s connexion', idClient);

        this.communicationLayer.linkClientSocket(idClient, clientSocket);
        clientSocket.onDisconnect(async () => {
            debugTelnet('client %s disconnected', idClient);
            await this.destroyClient.execute(idClient);
        });

        await this.sendClientString.execute(domainClient.id, 'welcome.login', { _nolf: true });
        clientSocket.onMessage(async (message: string) => {
            // in telnet
            // the first two messages are used to receive credentials
            // the subsequent messages must be parsed
            const csd = this.communicationLayer.getClientSession(idClient);
            const client = await this.getClient.execute(idClient);
            if (client.stage === CLIENT_STAGES.AUTHENTICATED) {
                // here the message should be interpreted as a command
                debugTelnet('user %s : %s', csd.userName, message);
            } else if (csd.userName !== '') {
                // here the message should be a password
                await csd.clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])); // Réactive l'écho (DONT WONT ECHO)
                await csd.clientSocket.send('\n');
                debugTelnet('client %s sending password', idClient);
                try {
                    await this.authenticateClient.execute(idClient, csd.userName, message);
                    if (client.stage === CLIENT_STAGES.BANNED) {
                        debugTelnet('user %s is banned - disconnecting user', csd.userName);
                        await this.destroyClient.execute(client.id);
                        return;
                    }
                    csd.userId = client.user ?? '';
                    debugTelnet('client %s is now authenticated as user', csd.userId);
                } catch (e) {
                    const error = e as Error;
                    debugTelnet('client %s authentication error: %s', idClient, error.message);
                    clientSocket.close();
                }
            } else {
                // here the message should be a user login name
                csd.userName = message;
                await this.sendClientString.execute(client.id, 'welcome.password', { _nolf: true });
                await csd.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // Désactive l'écho (DO WONT ECHO)
                debugTelnet('client %s sending login : %s', idClient, csd.userName);
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
