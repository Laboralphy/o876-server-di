import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';
import { ICommunicationManager } from '../../application/ports/services/ICommunicationManager';
import { ClientSession } from '../../domain/types/ClientSession';
import { ClientContext } from '../client-context/ClientContext';

/**
 * This class is used by the use-case application layer to easily perform low level network operations
 * regardless of the type of socket owned by the user.
 * The use cases must be agnostic of the socket type.
 */
export class CommunicationLayer implements ICommunicationManager {
    private readonly clientSessions: Map<string, ClientSession> = new Map();
    private readonly userClients: Map<string, string> = new Map();

    linkClientSocket(idClient: string, clientSocket: IClientSocket): void {
        const clientSession: ClientSession = {
            clientSocket,
            userName: '',
            userId: '',
        };
        this.clientSessions.set(idClient, clientSession);
        const clientContext = new ClientContext(clientSession);
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
        const cs = this.getClientSession(idClient);
        cs.clientSocket.close();
        this.userClients.delete(cs.userId);
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
