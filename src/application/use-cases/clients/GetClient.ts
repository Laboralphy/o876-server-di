import { IClientRepository } from '../../../domain/ports/repositories/IClientRepository';
import { Cradle } from '../../../config/container';
import { Client } from '../../../domain/entities/Client';

export class GetClient {
    private readonly clientRepository: IClientRepository;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
    }

    async execute(id: string): Promise<Client | undefined> {
        const client = await this.clientRepository.get(id);
        if (client) {
            return client;
        } else {
            return undefined;
        }
    }
}
