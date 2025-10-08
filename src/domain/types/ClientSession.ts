import { IClientSocket } from '../ports/adapters/IClientSocket';

export type ClientSession = {
    clientSocket: IClientSocket;
    login: string;
    user: string;
};
