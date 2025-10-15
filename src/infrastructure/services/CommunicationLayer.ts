import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { ClientSession } from '../../domain/types/ClientSession';

/**
 * This class is used by the use-case application layer to easily perform low level network operations
 * regardless of the type of socket owned by the user.
 * The use cases must be agnostic of the socket type.
 */
export class CommunicationLayer implements ICommunicationLayer {
    private readonly clientSessions: Map<string, ClientSession> = new Map();

    linkClientSocket(idClient: string, clientSocket: IClientSocket): void {
        const clientSession: ClientSession = {
            clientSocket,
            login: '',
            user: null,
        };
        this.clientSessions.set(idClient, clientSession);
    }

    getClientSession(idClient: string): ClientSession {
        const cs = this.clientSessions.get(idClient);
        if (cs) {
            return cs;
        } else {
            throw new Error(`could not find client ${idClient} session`);
        }
    }

    dropClient(idClient: string): void {
        const cs = this.clientSessions.get(idClient);
        if (cs) {
            cs.clientSocket.close(); // will cause a "onDisconnect" event
        }
        this.clientSessions.delete(idClient);
    }

    async sendMessage(idClient: string, message: string): Promise<void> {
        return this.getClientSession(idClient).clientSocket.send(message);
    }

    dropAllClients() {
        this.clientSessions.forEach((clientSession, idClient) => {
            this.dropClient(idClient);
        });
    }
}
