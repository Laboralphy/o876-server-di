import { IClientSocket } from '../../domain/ports/IClientSocket';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';

export class CommunicationLayer implements ICommunicationLayer {
    private readonly clientSockets: Map<string, IClientSocket> = new Map();

    linkClientSocket(idClient: string, clientSocket: IClientSocket): void {
        this.clientSockets.set(idClient, clientSocket);
    }

    dropClientSocket(idClient: string): void {
        const cs = this.clientSockets.get(idClient);
        if (cs) {
            cs.close();
            this.clientSockets.delete(idClient);
        }
    }

    async sendMessage(idClient: string, message: string): Promise<void> {
        const cs = this.clientSockets.get(idClient);
        if (cs) {
            return cs.send(message);
        }
    }

    dropAllClients() {
        this.clientSockets.forEach((client, idClient) => {
            this.dropClientSocket(idClient);
        });
    }
}
