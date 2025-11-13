import { IClientSocket } from '../ports/adapters/IClientSocket';
import { User } from '../entities/User';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { CLIENT_STATES } from '../enums/client-states';

/**
 * This type store everything related to client session
 * Instances of this type are created for a user when it connects and are destroyed when the client is disconnected
 *
 *
 */
export type ClientSession = {
    id: string; // client unique identifier
    clientContext: IClientContext; // Client context used by commands invoked by the user
    clientSocket: IClientSocket; // Instance to socket
    user: User | null; // Authenticated User, remains null if failed
    state: CLIENT_STATES;
    login: string; // This is what client has typed to identify itself
};
