import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { ClientSession } from '../../domain/types/ClientSession';
import { User } from '../../domain/entities/User';

/**
 * This class is used by the use-case application layer to easily perform low level network operations
 * regardless of the type of socket owned by the user.
 * The use cases must be agnostic of the socket type.
 */
export class CommunicationLayer implements ICommunicationLayer {
    private readonly clientSessions: Map<string, ClientSession> = new Map();

    linkClientSession(clientSession: ClientSession): void {
        this.clientSessions.set(clientSession.id, clientSession);
    }

    getClientSession(idClient: string): ClientSession {
        const cs = this.clientSessions.get(idClient);
        if (cs) {
            return cs;
        } else {
            throw new Error(`Could not find client ${idClient} session`);
        }
    }

    /**
     * Retrieve all clients id from a user instance.
     * @param user user instance
     */
    getUserClients(user: User): string[] {
        const aClients: string[] = [];
        for (const [idClient, clientSession] of this.clientSessions.entries()) {
            if (clientSession.user?.id === user.id) {
                aClients.push(idClient);
            }
        }
        return aClients;
    }

    /**
     * Destroy a client session forcing socket disconnection
     * Does nothing bad is client is already disconnected
     * Removes clientSession if exists
     * @param idClient client identifier
     */
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
