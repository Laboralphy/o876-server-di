import { IClientSocket } from '../ports/adapters/IClientSocket';
import { User } from '../entities/User';

/**
 * This type store everything related to client session
 * Instances of this type are created for a user when it connects and are destroyed when the client is disconnected
 *
 * used by:
 *  - ICommunicationLayer
 *
 * uses :
 *  - IClientSocket (a representation of a network socket)
 *
 */
export type ClientSession = {
    clientSocket: IClientSocket; // Instance to socket level
    login: string; // This is what client has typed to identify itself
    user: User | null; // Authenticated User
};
