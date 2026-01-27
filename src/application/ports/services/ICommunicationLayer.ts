import { ClientSession } from '../../../domain/types/ClientSession';
import { User } from '../../../domain/entities/User';

export interface ICommunicationLayer {
    /**
     * Associates a client id with a clientSocket.
     * @param clientSession client socket instance
     */
    linkClientSession(clientSession: ClientSession): void;

    /**
     * Dissociate a clientsession
     * @param clientSession
     */
    unlinkClientSession(clientSession: ClientSession): void;

    /**
     * Get session data from a connected client. Returns undefined if client does not exist
     * @param idClient
     */
    getClientSession(idClient: string): ClientSession;

    /**
     * The server is willing to expel a client from the service.
     * @param idClient
     */
    dropClient(idClient: string): Promise<void>;

    /**
     * Sends a message to a client
     * @param idClient
     * @param message
     */
    sendMessage(idClient: string, message: string | Buffer): Promise<void>;

    /**
     * Immediately drops all connected client.
     * Used when the service is shutting down
     */
    dropAllClients(): Promise<void[]>;

    /**
     * Return client associated with a spécific user
     * if no client found (i.e. user not connected) the method returns undefined
     * @param user
     */
    getUserClient(user: User): ClientSession | undefined;
}
