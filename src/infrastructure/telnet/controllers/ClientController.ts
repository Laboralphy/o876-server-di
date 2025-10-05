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
     */
    connect(socket: TelnetClient) {
        const clientId = getUID();
        // register this socket
        const pRequestCredentials = this.requestCredentials.bind(this);
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
