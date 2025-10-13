import { IClientSocket } from '../ports/adapters/IClientSocket';

export type ClientSession = {
    clientSocket: IClientSocket; // Instance to socket level
    userName: string; // user name
    userId: string; // user identifier
};
