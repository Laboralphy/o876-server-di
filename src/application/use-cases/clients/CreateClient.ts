import { Client, CLIENT_PROTOCOL, CLIENT_STAGES } from '../../../domain/entities/Client';
import { Cradle } from '../../../config/container';
import { IUIDGenerator } from '../../ports/services/IUIDGenerator';
import { IClientRepository } from '../../../domain/ports/repositories/IClientRepository';
import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';
import { ICommunicationManager } from '../../ports/services/ICommunicationManager';

/**
 * This use case creates a new client, with auto generated unique identifier
 * The client is initialized at stage login.
 */
export class CreateClient {
    private readonly uidGenerator: IUIDGenerator;
    private readonly clientRepository: IClientRepository;
    private readonly communicationLayer: ICommunicationManager;

    constructor(cradle: Cradle) {
        this.uidGenerator = cradle.uidGenerator;
        this.clientRepository = cradle.clientRepository;
        this.communicationLayer = cradle.communicationLayer;
    }

    async execute(clientSocket: IClientSocket, protocol: CLIENT_PROTOCOL): Promise<Client> {
        const client: Client = {
            id: this.uidGenerator.getUID(),
            stage: CLIENT_STAGES.LOGIN,
            user: null,
            protocol,
        };
        this.communicationLayer.linkClientSocket(client.id, clientSocket);
        return this.clientRepository.save(client);
    }
}
