import { Cradle } from '../../../config/container';
import { IClientRepository } from '../../../domain/ports/repositories/IClientRepository';
import { ICommunicationManager } from '../../ports/services/ICommunicationManager';

/**
 * This use case destroys a registered client, because its connection has been close.
 * Do not destroy a client whose connection is still active.
 * Same as CreateClient is called in reaction of a new client connection
 * DestroyClient is called in reaction of a client being disconnected
 */
export class DestroyClient {
    private readonly clientRepository: IClientRepository;
    private readonly communicationLayer: ICommunicationManager;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
        this.communicationLayer = cradle.communicationLayer;
    }

    async execute(idClient: string): Promise<void> {
        const client = await this.clientRepository.get(idClient);
        // If this use case is initiated by the server, then the client socket dropping will certainly
        // trigger the use case a second time, but as the client will be dropped, nothing serious will occur.
        if (client) {
            this.communicationLayer.dropClient(idClient);
            // drop client socket, this use case will not do anything the next time it is called.
            await this.clientRepository.delete(client);
        }
    }
}
