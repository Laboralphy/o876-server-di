import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';
import { ClientSession } from '../../../domain/types/ClientSession';

export interface ICommunicationManager {
    /**
     * Associates a client with a clientSocket.
     * This method is usually called by a controller
     * @param idClient
     * @param clientSocket
     */
    linkClientSocket(idClient: string, clientSocket: IClientSocket): void;

    /**
     * Associates a user with a clientSession
     * @param idClient
     * @param idUser
     */
    bindClientUser(idClient: string, idUser: string): void;

    /**
     * Get user previously associated with client with the method `bindClientUser`
     * @param idUser
     */
    findUserClient(idUser: string): ClientSession;

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
}
