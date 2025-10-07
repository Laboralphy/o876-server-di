import { CLIENT_STAGES } from '../../../domain/entities/Client';
import { Cradle } from '../../../config/container';
import { IClientRepository } from '../../ports/repositories/IClientRepository';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';

/**
 * This use case destroys a registered client, because its connection has been close.
 * Do not destroy a client whose connection is still active.
 * Same as CreateClient is called in reaction of a new client connection
 * DestroyClient is called in reaction of a client being disconnected
 */
export class DestroyClient {
    private readonly clientRepository: IClientRepository;
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
        this.communicationLayer = cradle.communicationLayer;
    }

    async execute(idClient: string): Promise<void> {
        const client = await this.clientRepository.get(idClient);
        // if client is connected then we must tell the communication layer that we want this client
        // to be disconnected.
        // if client stage is DESTROYING then the communication layer tells us that the client
        // has disconnected by its initiative, and it must be removed from the registry
        if (client) {
            switch (client.stage) {
                case CLIENT_STAGES.DESTROYING: {
                    // the client connection is about to be closed
                    // we must remove the client from registry
                    return this.clientRepository.delete(client);
                }

                default: {
                    // we kick this client, but the communication layer is unaware
                    // so we tell the communication layer to close its connection
                    // hopefully the communication layer will change client stage to DESTROYING
                    // and will re call DestroyClient use case to finish the job
                    this.communicationLayer.dropClientSocket(idClient);
                    client.stage = CLIENT_STAGES.DESTROYING;
                    await this.clientRepository.save(client);
                    break;
                }
            }
        }
    }
}
