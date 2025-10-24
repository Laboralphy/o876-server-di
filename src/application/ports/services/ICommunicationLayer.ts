import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';
import { ClientSession } from '../../../domain/types/ClientSession';
import { User } from '../../../domain/entities/User';

export interface ICommunicationLayer {
    /**
     * Associates a client with a clientSocket.
     * This method is usually called by a controller
     * @param clientSocket
     */
    linkClientSocket(clientSocket: IClientSocket): void;

    /**
     * Get session data from a connected client. Returns undefined if client does not exist
     * @param idClient
     */
    getClientSession(idClient: string): ClientSession;

    /**
     * The server is willing to expel a client from the service.
     * @param idClient
     */
    dropClient(idClient: string): void;

    /**
     * Sends a message to a client
     * @param idClient
     * @param message
     */
    sendMessage(idClient: string, message: string): Promise<void>;

    /**
     * Immediately drops all connected client.
     * Used when the service is shutting down
     */
    dropAllClients(): void;

    getUserClients(user: User): string[];
}
