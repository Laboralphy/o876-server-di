import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import Telnet, { Command } from '../../../@types/telnet2';

export class TelnetClientSocket implements IClientSocket {
    private readonly options = new Set<string>();

    constructor(private readonly clientWrapperSocket: Telnet.Client) {}

    close(): void {
        this.clientWrapperSocket.destroy();
    }

    onMessage(callback: (message: string | Buffer) => void): void {
        this.clientWrapperSocket.on('data', (data: Buffer) => {
            // trim CR/LF at the end.
            callback(data.toString().trimEnd());
            // watch out for binary data
        });
        this.clientWrapperSocket.on('command', (cmd: Command) => {
            const { command, data, option } = cmd;
            switch (command + ' ' + option) {
                case 'will gmcp': {
                    // Client is turning GMCP on
                    this.options.add('gmcp');
                    break;
                }

                case 'sb gmcp': {
                    if (this.options.has('gmcp')) {
                        callback(data);
                    }
                    break;
                }

                default: {
                    break;
                }
            }
        });
    }

    send(message: string | Buffer): Promise<void> {
        return new Promise((resolve) => {
            const socket = this.clientWrapperSocket;
            if (!message) {
                resolve();
                return;
            }
            const bWriteOk = socket.write(message);
            if (bWriteOk) {
                // Buffer wasn't full, data has been sent, resolving promise
                process.nextTick(resolve);
            } else {
                // Buffer is full : data not sent : waiting for 'drain' event
                socket.once('drain', () => {
                    // all's good, data has been sent, resolving promise
                    resolve(undefined);
                });
            }
        });
    }

    onDisconnect(callback: () => void): void {
        this.clientWrapperSocket.on('close', () => {
            callback();
        });
    }
}
