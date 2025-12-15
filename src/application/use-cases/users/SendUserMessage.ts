import { Cradle } from '../../../boot/container';
import { JsonObject } from '../../../domain/types/JsonStruct';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { SendClientMessage } from '../clients/SendClientMessage';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';

export class SendUserMessage {
    private readonly communicationLayer: ICommunicationLayer;
    private readonly userRepository: IUserRepository;
    private readonly sendClientMessage: SendClientMessage;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
        this.sendClientMessage = cradle.sendClientMessage;
        this.userRepository = cradle.userRepository;
    }

    async execute(userId: string, key: string, parameters?: JsonObject): Promise<void> {
        const user = await this.userRepository.get(userId);
        if (!user) {
            throw new ReferenceError(`User ${userId} not found`);
        }
        const client = this.communicationLayer.getUserClient(user);
        if (!client) {
            throw new ReferenceError(`User ${userId} not connected`);
        }
        return this.sendClientMessage.execute(client.id, key, parameters);
    }
}
