import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import Telnet, { Command } from '../../../@types/telnet2';

export class TelnetClientSocket implements IClientSocket {
    private readonly options = new Set<string>();

    constructor(private readonly clientSock: Telnet.Client) {}

    close(): void {
        this.clientSock.destroy();
    }

    onMessage(callback: (message: string | Buffer) => void): void {
        this.clientSock.on('data', (data: Buffer) => {
            // trim CR/LF at the end.
            callback(data.toString().trimEnd());
            // watch out for binary data
        });
        this.clientSock.on('command', (cmd: Command) => {
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
            const socket = this.clientSock;
            if (!message) {
                resolve();
                return;
            }
            // const utf8String = Buffer.from(encoder.encode(message.toString()));
            // const bWriteOk = socket.write(utf8String);
            const bWriteOk = socket.write(message);
            if (!bWriteOk) {
                // Buffer is full : data not sent : waiting for 'drain' event
                socket.once('drain', () => {
                    // all's good, data has been sent, resolving promise
                    resolve(undefined);
                });
            } else {
                // Buffer wasn't full, data has been sent, resolving promise
                process.nextTick(resolve);
            }
        });
    }

    onDisconnect(callback: () => void): void {
        this.clientSock.on('close', () => {
            callback();
        });
    }
}
