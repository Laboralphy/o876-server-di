import { IClientSocket } from '../ports/adapters/IClientSocket';
import { User } from '../entities/User';

export type ClientSession = {
    clientSocket: IClientSocket; // Instance to socket level
    login: string; // This is what client has typed to identify itself
    user: User | null;
};
