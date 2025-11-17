import { IControllerMessageProcessor, Outcome } from './IControllerMessageProcessor';
import { ClientSession } from '../../domain/types/ClientSession';
import { JsonValue } from '../../domain/types/JsonStruct';

export abstract class AbstractMessageProcessor<T extends Outcome>
    implements IControllerMessageProcessor<T>
{
    protected constructor(private readonly clientSession: ClientSession) {}

    abstract processMessage(message: string): Promise<T>;

    echo(b: boolean): Promise<void> {
        const clientSocket = this.clientSession.clientSocket;
        return b
            ? clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])) // reactivate echo
            : clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // deactivate echo
    }

    send(s: string) {
        return this.clientSession.clientSocket.send(s);
    }

    sendMessage(key: string, parameters?: Record<string, JsonValue>) {
        return this.clientSession.clientContext.sendMessage(key, parameters);
    }
}
