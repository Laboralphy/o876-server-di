import * as Txat from '../../libs/txat';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { Cradle } from '../../boot/container';
import { TXAT_EVENTS } from '../../libs/txat/events';

export type ChannelDefinition = {
    id: string; // channel id
    tag: string; // This could be a clan channel, or a localized channel
    readonly: boolean; // This channel is for announcements only
};

export class ChatManager {
    private readonly _txat = new Txat.System();
    private channelDefinitions = new Map<string, ChannelDefinition>();
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
        const txatEvents = this._txat.events;
        // When user speak on a channel
        txatEvents.on(
            TXAT_EVENTS.MESSAGE_POST,
            ({ recv, channel, user, message }: { recv: string; channel: Txat.Channel; user }) => {}
        );
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
