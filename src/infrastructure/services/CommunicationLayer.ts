import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { ClientSession } from '../../domain/types/ClientSession';
import { User } from '../../domain/entities/User';
import { CLIENT_STATES } from '../../domain/enums/client-states';

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

    unlinkClientSession(clientSession: ClientSession): void {
        this.clientSessions.delete(clientSession.id);
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
    getUserClient(user: User): ClientSession | undefined {
        for (const [, clientSession] of this.clientSessions.entries()) {
            if (clientSession.user?.id === user.id) {
                return clientSession;
            }
        }
        return undefined;
    }

    /**
     * Destroy a client session forcing socket disconnection
     * Does nothing bad is client if already disconnected
     * Removes clientSession if exists
     * @param idClient client identifier
     */
    async dropClient(idClient: string): Promise<void> {
        const cs = this.clientSessions.get(idClient);
        if (cs && cs.state !== CLIENT_STATES.LOGOUT) {
            cs.state = CLIENT_STATES.LOGOUT;
            await cs.clientContext.closeConnection();
            cs.clientSocket.close(); // will cause a "onDisconnect" event
            this.unlinkClientSession(cs);
        }
    }

    async sendMessage(idClient: string, message: string | Buffer): Promise<void> {
        return this.getClientSession(idClient).clientSocket.send(message);
    }

    async dropAllClients(): Promise<void[]> {
        return Promise.all(
            Array.from(this.clientSessions.entries()).map(([idClient]) => this.dropClient(idClient))
        );
    }
}
