import { Client as TelnetClient } from '../../../../@types/telnet2';
import { Cradle } from '../../../config/container';
import { CreateClient } from '../../../application/use-cases/clients/CreateClient';
import { CLIENT_PROTOCOL, CLIENT_STAGES } from '../../../domain/entities/Client';
import { AuthenticateClient } from '../../../application/use-cases/clients/AuthenticateClient';
import { printDbg } from '../../../libs/print-dbg';
import { ICommunicationLayer } from '../../../application/ports/services/ICommunicationLayer';
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
    private readonly communicationLayer: ICommunicationLayer;

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
        const domainClient = await this.createClient.execute(CLIENT_PROTOCOL.TELNET);
        const idClient = domainClient.id;
        debugTelnet('client %s connexion', idClient);

        const vsocket = new TelnetClientSocket(socket);
        this.communicationLayer.linkClientSocket(idClient, vsocket);

        vsocket.onDisconnect(() => {
            this.destroyClient.execute(idClient);
        });

        vsocket.onMessage(async (message: string) => {
            // in telnet
            // the first two messages are used to receive credentials
            // the subsequent messages must be parsed
            let login = '';
            switch (domainClient.stage) {
                case CLIENT_STAGES.LOGIN: {
                    // here the message should be a login
                    login = message;
                    debugTelnet('client %s sending login : %s', idClient, login);
                    break;
                }

                case CLIENT_STAGES.PASSWORD: {
                    // here the message should be a password
                    debugTelnet('client %s sending password', idClient);
                    const user = await this.authenticateClient.execute(
                        idClient,
                        login,
                        message.toString()
                    );
                    debugTelnet('client %s is now authenticated as user', user.name);
                    break;
                }

                case CLIENT_STAGES.AUTHENTICATED: {
                    // here the message should be interpreted as a command
                    debugTelnet('user %s : %s', login, message.toString());
                    break;
                }

                default: {
                    throw new Error(`client stage value invalid ${domainClient.stage}`);
                }
            }
        });
    }
}
