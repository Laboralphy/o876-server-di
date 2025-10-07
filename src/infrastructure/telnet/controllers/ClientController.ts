import telnet, { Client as TelnetClient } from '../../../../@types/telnet2';
import { Cradle } from '../../../config/container';
import { CreateClient } from '../../../application/use-cases/clients/CreateClient';
import { GetClient } from '../../../application/use-cases/clients/GetClient';
import { CLIENT_STAGES } from '../../../domain/entities/Client';
import { SetClientLogin } from '../../../application/use-cases/clients/SetClientLogin';
import { AuthenticateClient } from '../../../application/use-cases/clients/AuthenticateClient';
import { printDbg } from '../../../libs/print-dbg';

const debugTelnet = printDbg('telnet');

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class ClientController {
    private readonly createClient: CreateClient;
    private readonly getClient: GetClient;
    private readonly authenticateClient: AuthenticateClient;
    private readonly setClientLogin: SetClientLogin;
    private readonly idClients: Map<TelnetClient, string> = new Map();

    constructor(cradle: Cradle) {
        this.createClient = cradle.createClient;
        this.getClient = cradle.getClient;
        this.setClientLogin = cradle.setClientLogin;
        this.authenticateClient = cradle.authenticateClient;
    }
    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    async connect(socket: TelnetClient) {
        // create client
        const domainClient = await this.createClient.execute();
        this.idClients.set(socket, domainClient.id);
        debugTelnet('client %s connexion', domainClient.id);
        // firsts messages are expected to be credentials
        // login (first message), then password (second message)
        socket.on('data', async (message: Buffer) => {
            const clientId = this.idClients.get(socket);
            // socket should have an associated id
            if (!clientId) {
                throw new Error(`client message: a socket with no client id has sent a message`);
            }
            const client = await this.getClient.execute(clientId);
            // associated id should reference an in-memory client entity
            if (!client) {
                throw new Error(
                    `client message: a socket associated with an invalid client id ${clientId} has sent a message`
                );
            }
            // now checking client stage
            switch (client.stage) {
                case CLIENT_STAGES.LOGIN: {
                    // here the message should be a login
                    const sLogin = message.toString();
                    debugTelnet('client %s sending login : %s', domainClient.id, sLogin);
                    await this.setClientLogin.execute(clientId, sLogin);
                    break;
                }

                case CLIENT_STAGES.PASSWORD: {
                    // here the message should be a password
                    debugTelnet('client %s sending password', domainClient.id);
                    const user = await this.authenticateClient.execute(
                        clientId,
                        message.toString()
                    );
                    debugTelnet('client %s is now authenticated as user', user.name);
                    break;
                }

                case CLIENT_STAGES.CONNECTED: {
                    // here the message should be interpreted as a command
                    debugTelnet('user %s : %s', client.login, message.toString());
                    break;
                }

                default: {
                    throw new Error(`client stage value invalid ${client.stage}`);
                }
            }
        });
        socket.on('close', () => {
            const idClient = this.idClients.get(socket);
            debugTelnet('client %s : connection closed', idClient ?? '<unknown>');
            this.idClients.delete(socket);
        });
        socket.on('error', (err) => {
            debugTelnet('socket error emitted : %s', err.message);
        });
    }
}
