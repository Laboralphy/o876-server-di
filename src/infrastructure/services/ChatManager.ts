import * as Txat from '../../libs/txat';
import { Cradle } from '../../boot/container';
import { TXAT_EVENTS } from '../../libs/txat/events';
import { SendUserMessage } from '../../application/use-cases/users/SendUserMessage';
import { IChatManager } from '../../application/ports/services/IChatManager';
import { CHANNEL_ATRIBUTES } from '../../libs/txat/channel-attributes';
import { User } from '../../domain/entities/User';

const SCOPED_CHANNEL_SEPARATOR = '#';

export type ChannelDefinition = {
    id: string; // channel id
    tag: string; // This could be a clan channel, or a localized channel
    persistent: boolean; // This channel will not be dropped when user count is reduced to zero
    readonly: boolean; // This channel is for announcements only
    scoped: boolean; // If true, this channel is scoped to a localization or a membership (clan, area, team...)
    color: string; // channel default color
    autojoin: boolean; // if true, all user will join this channel
};

export class ChatManager implements IChatManager {
    private readonly _txat = new Txat.System();
    private channelDefinitions = new Map<string, ChannelDefinition>();
    private readonly sendUserMessage: SendUserMessage;
    private readonly scopedChannelPrefixes = new Map<string, ChannelDefinition>();

    constructor(cradle: Cradle) {
        // Each txat events DTO has a "recv" property -> user identifier
        this.sendUserMessage = cradle.sendUserMessage;

        const txatEvents = this._txat.events;
        // When user speaks on a channel
        txatEvents.on(
            TXAT_EVENTS.MESSAGE_POST,
            ({ recv, channel, user, message }: Txat.MessagePostDto) =>
                this.onMessagePost(recv, channel, user, message)
        );

        txatEvents.on(TXAT_EVENTS.YOU_JOINED, ({ recv, channel }: Txat.YouJoinedDto) =>
            this.onYouJoined(recv, channel)
        );

        txatEvents.on(TXAT_EVENTS.YOU_LEFT, ({ recv, channel }: Txat.YouLeftDto) =>
            this.onYouLeft(recv, channel)
        );

        txatEvents.on(TXAT_EVENTS.USER_JOINED, ({ recv, channel, user }: Txat.ChannelJoinedDto) =>
            this.onUserJoined(recv, user, channel)
        );

        txatEvents.on(TXAT_EVENTS.USER_LEFT, ({ recv, channel, user }: Txat.ChannelLeftDto) =>
            this.onUserLeft(recv, user, channel)
        );
    }

    defineChannel(cd: ChannelDefinition) {
        if (cd.scoped) {
            this.scopedChannelPrefixes.set(cd.tag, cd);
        }
        this.channelDefinitions.set(cd.id, cd);
    }

    postMessage(idSender: string, idChannel: string, message: string) {
        this._txat.postMessage(idSender, idChannel, message);
    }

    registerUser(user: User) {
        this._txat.registerUser(user.id, user.displayName);
        for (const cd of this.channelDefinitions.values()) {
            if (cd.autojoin) {
                this.joinChannel(user.id, cd.id);
            }
        }
    }

    unregisterUser(user: User) {
        this._txat.unregisterUser(user.id);
    }

    private joinScopedChannel(idUser: string, idChannel: string): void {
        const rootId = idChannel.split(SCOPED_CHANNEL_SEPARATOR).shift() ?? '';
        const cd = this.scopedChannelPrefixes.get(rootId);
        if (cd) {
            // Let's try to join or create channel
            if (!this._txat.isChannelExists(idChannel)) {
                // Create scoped channel first
                const channel = this._txat.addChannel(idChannel, cd.tag);
                if (cd.persistent) {
                    // usually scoped channel are not persistent
                    channel.attributes.add(CHANNEL_ATRIBUTES.PERSISTANT);
                }
                // scoped channel should not be listed (too many of them)
                channel.attributes.add(CHANNEL_ATRIBUTES.HIDDEN);
            }
            this._txat.userJoinChannel(idUser, idChannel);
        } else {
            throw new ReferenceError(`Scoped channel definition does not exist: ${idChannel}`);
        }
    }

    joinChannel(idUser: string, idChannel: string): void {
        if (idChannel.includes(SCOPED_CHANNEL_SEPARATOR)) {
            this.joinScopedChannel(idUser, idChannel);
            return;
        }
        if (!this._txat.isChannelExists(idChannel)) {
            const cd = this.channelDefinitions.get(idChannel);
            if (cd) {
                const channel = this._txat.addChannel(idChannel);
                if (cd.persistent) {
                    channel.attributes.add(CHANNEL_ATRIBUTES.PERSISTANT);
                }
            } else {
                throw new ReferenceError(
                    `Could not create channel ${idChannel} : no definition found`
                );
            }
        }
        this._txat.userJoinChannel(idUser, idChannel);
    }

    getUserList(idChannel: string): string[] {
        const channel = this._txat.getChannel(idChannel);
        if (channel) {
            return channel.users.map((user) => user.id);
        } else {
            throw new ReferenceError(`Channel ${idChannel} does not exist`);
        }
    }

    /**
     * User has sent a message on a specific channel
     * @param recv
     * @param channel
     * @param user
     * @param message
     */
    async onMessagePost(
        recv: string,
        channel: Txat.Channel,
        user: Txat.UserPresence,
        message: Txat.Message
    ) {
        const cd = this.channelDefinitions.get(channel.id);
        const sender = this._txat.getUser(user.id);
        if (cd) {
            await this.sendUserMessage.execute(recv, 'chat-message-post', {
                chanColor: cd.color,
                channel: channel.id,
                userColor: user.color === '' ? cd.color : user.color,
                user: sender.name,
                message: message.content,
            });
        } else {
            throw new Error(`Unknown channel id: ${channel.id}`);
        }
    }

    /**
     * User has joined a specific channel
     * @param recv
     * @param channel
     */
    async onYouJoined(recv: string, channel: Txat.Channel) {
        await this.sendUserMessage.execute(recv, 'chat.youJoined', { channel: channel.id });
    }

    /**
     * User has left a specific channel
     * @param recv
     * @param channel
     */
    async onYouLeft(recv: string, channel: Txat.Channel) {
        await this.sendUserMessage.execute(recv, 'chat.youLeft', { channel: channel.id });
    }

    /**
     * User has joined a specific channel
     * @param recv
     * @param user
     * @param channel
     */
    async onUserJoined(recv: string, user: Txat.UserPresence, channel: Txat.Channel) {
        const u = this._txat.getUser(user.id);
        await this.sendUserMessage.execute(recv, 'chat.userJoined', {
            user: u.name,
            channel: channel.id,
        });
    }

    /**
     * User has left a specific channel
     * @param recv
     * @param user
     * @param channel
     */
    async onUserLeft(recv: string, user: Txat.UserPresence, channel: Txat.Channel) {
        const u = this._txat.getUser(user.id);
        await this.sendUserMessage.execute(recv, 'chat.userLeft', {
            user: u.name,
            channel: channel.id,
        });
    }
}
