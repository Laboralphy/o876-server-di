import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import { Client as TelnetClient } from 'telnet2';
import { TextEncoder } from 'node:util';
import { Command } from '../../../@types/telnet2';

const encoder = new TextEncoder();

export class TelnetClientSocket implements IClientSocket {
    private readonly options = new Set<string>();

    constructor(private readonly socket: TelnetClient) {}

    close(): void {
        this.socket.destroy();
    }

    onMessage(callback: (message: string | Buffer) => void): void {
        this.socket.on('data', (data: Buffer) => {
            // trim CR/LF at the end.
            callback(data.toString().trimEnd());
            // watch out for binary data
        });
        this.socket.on('command', (cmd: Command) => {
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
            const socket = this.socket;
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
        this.socket.on('close', () => {
            callback();
        });
    }
}
