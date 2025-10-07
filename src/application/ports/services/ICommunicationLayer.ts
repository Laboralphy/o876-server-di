import { IClientSocket } from '../../../domain/ports/IClientSocket';

export interface ICommunicationLayer {
    linkClientSocket(idClient: string, clientSocket: IClientSocket): void;
    dropClientSocket(idClient: string): void;
    sendMessage(idClient: string, message: string): Promise<void>;
    dropAllClients(): void;
}
