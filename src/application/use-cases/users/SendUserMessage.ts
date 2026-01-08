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

    async execute(
        userId: string,
        key: string,
        parameters?: JsonObject
    ): Promise<{ locale: boolean; template: boolean; gmcp: boolean; sent: boolean }> {
        const user = await this.userRepository.get(userId);
        if (!user) {
            throw new ReferenceError(`User ${userId} not found`);
        }
        const client = this.communicationLayer.getUserClient(user);
        if (client) {
            return this.sendClientMessage.execute(client.id, key, parameters);
        }
        return {
            gmcp: false,
            locale: false,
            sent: false,
            template: false,
        };
        // if there is no client attached to the user then maybe the user has just been disconnected
        // and the SendUserMessage.execute has been somehow delayed.
        // This happens when a user disconnected and the chat system is trying to notify the departing user
        // that he has left all previously joined channel
    }
}
