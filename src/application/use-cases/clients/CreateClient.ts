import { Client, CLIENT_PROTOCOL, CLIENT_STAGES } from '../../../domain/entities/Client';
import { Cradle } from '../../../config/container';
import { IUIDGenerator } from '../../ports/services/IUIDGenerator';
import { IClientRepository } from '../../ports/repositories/IClientRepository';

/**
 * This use case creates a new client, with auto generated unique identifier
 * The client is initialized at stage login.
 */
export class CreateClient {
    private readonly uidGenerator: IUIDGenerator;
    private readonly clientRepository: IClientRepository;

    constructor(cradle: Cradle) {
        this.uidGenerator = cradle.uidGenerator;
        this.clientRepository = cradle.clientRepository;
    }

    async execute(protocol: CLIENT_PROTOCOL): Promise<Client> {
        const client: Client = {
            id: this.uidGenerator.getUID(),
            stage: CLIENT_STAGES.LOGIN,
            user: null,
            protocol,
        };
        return this.clientRepository.save(client);
    }
}
