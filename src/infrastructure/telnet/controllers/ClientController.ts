import telnet, { Client as TelnetClient } from '../../../../@types/telnet2';
import { getUID } from '../../../libs/uid-generator';
import { JsonDatabase } from '../../services/JsonDatabase';

export class ClientController {
    private _pRequestCredentials: (messageBuffer: Buffer) => Promise<void>;

    constructor() {
        this._pRequestCredentials = this.requestCredentials.bind(this);
    }
    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    connect(socket: TelnetClient) {
        const clientId = getUID();
        const pRequestCredentials = this.requestCredentials.bind(this);
        // firsts messages are expected to be credentials
        // login (first message), then password (second message)
        socket.on('data', pRequestCredentials);
    }

    requestCredentials(messageBuffer: Buffer): Promise<void> {
        // receiving credentials
        const sMessage = messageBuffer.toString();

        return Promise.resolve();
    }

    requestMessage(messageBuffer: Buffer) {
        // receiving message
    }
}
