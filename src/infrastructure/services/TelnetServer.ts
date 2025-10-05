import telnet, { Client as TelnetClient } from '../../../@types/telnet2';
import { EventEmitter } from 'events';
import { printDbg } from '../../libs/print-dbg';
import { IClientCommunication } from '../../domain/ports/IClientCommunication';

const debugTelnet = printDbg('telnet');

class TelnetClientConnector implements IClientCommunication {
    public gmcp: boolean = false;

    constructor(private readonly telnetClient: TelnetClient) {
        telnetClient.on('');
    }

    sendMessage(message: string): Promise<void> {
        // send message do client
        return Promise.resolve();
    }

    disconnect(): Promise<void> {
        // disconnect client
        return Promise.resolve();
    }
}

type CommandType = {
    command: string;
    option: string;
    data: string | Buffer;
};

class TelnetServer {
    private readonly clients: Map<string, TelnetClient> = new Map();
    public events = new EventEmitter();
    constructor() {}

    // connectClient(socket: TelnetClient) {
    //     try {
    //         socket.on('command', async (oCommand: CommandType)=> {
    //             const {
    //                 command,
    //                 option,
    //                 data
    //             } = oCommand;
    //             switch (command + ' ' + option) {
    //                 case 'will gmcp': {
    //                     // TelnetClient is Turning GMCP ON
    //                     // logCtrl('TelnetClient::%s is supporting GMCP', client.id);
    //                     break;
    //                 }
    //
    //                 case 'sb gmcp': {
    //                     // sending a GMCP message
    //                     if (virtualSocket.options.get('gmcp')) {
    //                         await this.processContextMessage(context, (data instanceof Buffer) ? data : Buffer.from(data));
    //                     } // else ignore
    //                     break;
    //                 }
    //             }
    //         });
    //         /**
    //          * @param messageBuffer {Buffer}
    //          * @returns {Promise<void>}
    //          */
    //         const pRuntimePhase = async messageBuffer => {
    //             await this.processContextMessage(context, messageBuffer.toString().trim());
    //         };
    //         if (!context.data.has(CONTEXT_DATA_TELNET_SESSION)) {
    //             this._telnetPhaseInit(context);
    //         }
    //         const pLoginPhase = async messageBuffer => {
    //             const sMessage = messageBuffer.toString();
    //             switch (context.data.get(CONTEXT_DATA_TELNET_SESSION).loginPhase) {
    //                 case TELNET_PHASE.LOGIN: {
    //                     this._telnetPhaseLogin(context, sMessage);
    //                     break;
    //                 }
    //                 case TELNET_PHASE.PASSWORD: {
    //                     await this._telnetPhasePassword(context, sMessage);
    //                     // TODO ici on a eu une erreur : telnetSession est parfois undefined, et donc provoque une erreur
    //                     // Cela intervient lorsqu'on a voulu lancer une commande pendant la phase de login
    //                     // Faire attention à ne pas taper de commande avant le mot de passe
    //                     if (context.data.get(CONTEXT_DATA_TELNET_SESSION).loginPhase === TELNET_PHASE.LOGGED_IN) {
    //                         socket.off('data', pLoginPhase);
    //                         socket.on('data', pRuntimePhase);
    //                         context.data.delete(CONTEXT_DATA_TELNET_SESSION);
    //                     }
    //                     break;
    //                 }
    //             }
    //         };
    //         socket.on('data', pLoginPhase);
    //         socket.on('close', (hadError) => {
    //             logCtrl('TelnetClient socket is fully closed%s', hadError ? ' - but there was an error' : '');
    //             this.disconnectClient(client);
    //         });
    //         socket.on('end', () => {
    //             this.log('user::' + client.uid + ' has ended telnet session');
    //         });
    //         socket.on('error', (err) => {
    //             this.log('socket error emitted : ', err.message);
    //         });
    //         return {client, context};
    //     } catch (error) {
    //         console.error(error);
    //         socket.destroy();
    //     }
    // }

    connectClient(client: TelnetClient) {
        // make unicode characters work properly
        client.do.transmit_binary();
        // make the client emit 'window size' events
        client.do.window_size();
        // accept GMCP client
        client.do.gmcp();
    }

    listen() {
        telnet.createServer(
            {
                convertLF: false,
            },
            () => {
                return telnet.createServer(
                    {
                        convertLF: false,
                    },
                    (client: TelnetClient) => {
                        try {
                            this.connectClient(client);
                        } catch (err) {
                            console.error(
                                'Error during client connection phase :',
                                (err as Error).message
                            );
                            client.end();
                        }
                    }
                );
            }
        );
    }
}
