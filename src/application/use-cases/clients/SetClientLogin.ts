import { Client, CLIENT_STAGES } from '../../../domain/entities/Client';
import { Cradle } from '../../../config/container';
import { IClientRepository } from '../../ports/repositories/IClientRepository';

/**
 * This use case sets login, and waits for password
 * If client is not at stage LOGIN, the use case will fail
 * after login set, the client stage is set to PASSWORD
 */
export class SetClientLogin {
    private readonly clientRepository: IClientRepository;

    constructor(cradle: Cradle) {
        this.clientRepository = cradle.clientRepository;
    }

    async execute(clientId: string, login: string): Promise<Client> {
        const client = await this.clientRepository.get(clientId);
        if (client) {
            if (client.stage !== CLIENT_STAGES.LOGIN) {
                throw new Error(
                    `inadequate client stage, expected ${CLIENT_STAGES.LOGIN}, got ${client.stage}`
                );
            }
            client.login = login;
            client.stage = CLIENT_STAGES.PASSWORD;
            return this.clientRepository.save(client);
        } else {
            throw new Error(`client ${clientId} not found`);
        }
    }
}
