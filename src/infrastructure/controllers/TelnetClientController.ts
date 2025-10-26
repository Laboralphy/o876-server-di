import { Client as TelnetClient } from '../../../@types/telnet2';
import { TelnetClientSocket } from '../services/TelnetClientSocket';
import { AbstractClientController } from './AbstractClientController';

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class TelnetClientController extends AbstractClientController {
    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    async connect(socket: TelnetClient) {
        const clientSocket = new TelnetClientSocket(socket);
        // create new client session
        const clientSession = this.initClientSession(clientSocket);
        const idClient = clientSession.id;
        const clientContext = clientSession.clientContext;
        await clientContext.sendMessage('welcome.login', { _nolf: true });
        clientSocket.onMessage(async (message: string) => {
            // in telnet
            // the first two messages are used to receive credentials
            // the subsequent messages must be parsed
            const user = this.getAuthenticatedUser(idClient);
            const login = this.getLogin(idClient);
            if (user) {
                // here the message should be interpreted as a command
                await this.execCommand(idClient, message);
            } else if (login) {
                // here the message should be a password
                await clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])); // Réactive l'écho (DONT WONT ECHO)
                await clientSocket.send('\n');
                await this.setLoginPassword(idClient, message);
            } else {
                // here the message should be a user login name
                await this.setLoginUsername(idClient, message);
                await clientContext.sendMessage('welcome.password', { _nolf: true });
                await clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // Désactive l'écho (DO WONT ECHO)
            }
        });
    }
}
