import { container } from '../../config/container';
import { printDbg } from '../../libs/print-dbg';
import telnet, { Server as TelnetServer, Client as TelnetClient } from 'telnet2';

const debugTelnet = printDbg('telnet');

class TelnetService {
    private _server: TelnetServer | undefined;

    get server(): TelnetServer {
        if (!this._server) {
            throw new Error('Telnet server is not initialized');
        }
        return this._server;
    }

    async createServer(port: number) Promise<TelnetServer> {
        debugTelnet('starting telnet service');
        this._server = telnet.createServer(
            {
                convertLF: false,
            },
            () => {
                return telnet.createServer(
                    {
                        convertLF: false,
                    },
                    async (client: TelnetClient) => {
                        try {
                            const telnetClientController =
                                container.resolve('telnetClientController');
                            await telnetClientController.connect(client);
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
        this._server.listen(port, () => {
            debugTelnet('telnet service is now listening on port %d', port);
            resolve(this._server);
        });
    }
}
