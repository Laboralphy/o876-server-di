import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import { Client as TelnetClient } from 'telnet2';

export class TelnetClientSocket implements IClientSocket {
    constructor(private readonly socket: TelnetClient) {}

    close(): void {
        this.socket.destroy();
    }

    onMessage(callback: (message: string) => void): void {
        this.socket.on('data', (data: Buffer) => {
            // trim CR/LF at the end.
            callback(data.toString().trimEnd());
            // watch out for binary data
        });
    }

    send(message: string | Buffer): Promise<void> {
        return new Promise((resolve) => {
            const socket = this.socket;
            if (!message) {
                resolve();
                return;
            }
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
