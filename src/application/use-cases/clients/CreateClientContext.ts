import { Cradle } from '../../../config/container';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { ClientContext } from '../../../domain/classes/ClientContext';
import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';

export class CreateClientContext {
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
    }

    execute(clientSocket: IClientSocket): void {
        // Create context and associate it with client.
        await this.communicationLayer.linkClientSocket(clientSocket);
        const cc = new ClientContext(idClient);
    }
}
