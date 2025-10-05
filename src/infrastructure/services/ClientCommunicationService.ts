import { IClientCommunication } from '../../domain/ports/IClientCommunication';

/**
 * This class hold client communication entities that do not fit in the domain layer
 * because they are highly technical and low level.
 * The domain layer keep the clientId only.
 */
export class ClientCommunicationService {
    private clients = new Map<string, IClientCommunication>();

    register(clientId: string, communication: IClientCommunication): void {
        this.clients.set(clientId, communication);
    }

    get(clientId: string): IClientCommunication | undefined {
        return this.clients.get(clientId);
    }

    unregister(clientId: string): void {
        this.clients.delete(clientId);
    }
}
