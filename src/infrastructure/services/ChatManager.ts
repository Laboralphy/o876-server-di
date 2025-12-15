import * as Txat from '../../libs/txat';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { Cradle } from '../../boot/container';
import { TXAT_EVENTS } from '../../libs/txat/events';
import { SendUserMessage } from '../../application/use-cases/users/SendUserMessage';

export type ChannelDefinition = {
    id: string; // channel id
    tag: string; // This could be a clan channel, or a localized channel
    readonly: boolean; // This channel is for announcements only
};

export class ChatManager {
    private readonly _txat = new Txat.System();
    private channelDefinitions = new Map<string, ChannelDefinition>();
    private readonly communicationLayer: ICommunicationLayer;
    private readonly sendUserMessage: SendUserMessage;

    constructor(cradle: Cradle) {
        // Each txat events DTO has a "recv" property -> user identifier
        this.communicationLayer = cradle.communicationLayer;
        this.sendUserMessage = cradle.sendUserMessage;

        const txatEvents = this._txat.events;
        // When user speaks on a channel
        txatEvents.on(
            TXAT_EVENTS.MESSAGE_POST,
            ({ recv, channel, user, message }: Txat.MessagePostDto) =>
                this.onMessagePost(recv, channel, user, message)
        );
    }

    /**
     * User has sent a message on a specific channel
     * @param recv
     * @param channel
     * @param user
     * @param message
     */
    onMessagePost(
        recv: string,
        channel: Txat.Channel,
        user: Txat.UserPresence,
        message: Txat.Message
    ) {
        this.sendUserMessage.execute(user.id, 'chat-message-post', {
            chanColor: ''
            channel: channel.id,
            userColor: user.color
            user:
            message
        });
    }

    /**
     * User defined by its id will join a channel
     * Will register user if not registered
     * Will create channel if not created
     * @param userId
     * @param channelId
     */
    userJoinChannel(userId: string, channelId: string) {
        if (!this._txat.isUserRegistered(userId)) {
            this._txat.registerUser(userId);
        }
    }
}
