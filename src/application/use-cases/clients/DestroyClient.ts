import { Client, CLIENT_STAGES } from '../../../domain/entities/Client';
import { Cradle } from '../../../config/container';
import { IUIDGenerator } from '../../ports/services/IUIDGenerator';
import { IClientRepository } from '../../ports/repositories/IClientRepository';

/**
 * This use case destroys a registered client, because its connection has been close.
 * Do not destroy a client whose connection is still active.
 * Same as CreateClient is called in reaction of a new client connection
 * DestroyClient is called in reaction of a client being disconnected
 */
export class DestroyClient {
    private readonly clientRepository: IClientRepository;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
    }

    async execute(idClient: string): Promise<void> {
        const client = await this.clientRepository.get(idClient);
        return client ? this.clientRepository.delete(client) : Promise.resolve(undefined);
    }
}
