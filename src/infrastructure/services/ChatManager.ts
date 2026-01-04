import * as Txat from '../../libs/txat';
import { POWERS } from '../../libs/txat';
import { Cradle } from '../../boot/container';
import { TXAT_EVENTS } from '../../libs/txat/events';
import { SendUserMessage } from '../../application/use-cases/users/SendUserMessage';
import { ChannelListItem, IChatManager } from '../../application/ports/services/IChatManager';
import { CHANNEL_ATRIBUTES } from '../../libs/txat/channel-attributes';
import { User } from '../../domain/entities/User';
import { SPECIAL_MESSAGE } from '../../domain/enums/special-message';
import { ChannelDefinition } from '../../domain/types/ChannelDefinition';
import { ROLES } from '../../domain/enums/roles';

const SCOPED_CHANNEL_SEPARATOR = '#';

export class ChatManager implements IChatManager {
    private readonly _txat = new Txat.System();
    private readonly channelDefinitions = new Map<string, ChannelDefinition>();
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

        // Other possible events :
        // TXAT_EVENTS.YOU_JOINED
        // TXAT_EVENTS.YOU_LEFT
        // TXAT_EVENTS.USER_JOINED
        // TXAT_EVENTS.USER_LEFT
    }

    defineChannel(cd: ChannelDefinition) {
        if (cd.scoped) {
            this.scopedChannelPrefixes.set(cd.tag, cd);
        }
        this.channelDefinitions.set(cd.id, cd);
    }

    /**
     * Turns a channel on or off
     * when turned off, the user is not notified of messages
     * @param idUser
     * @param idChannel
     * @param bValue
     */
    toggleChannel(idUser: string, idChannel: string, bValue: boolean): void {
        const channel = this._txat.getChannel(idChannel);
        const user = channel.getUser(idUser);
        if (user) {
            if (bValue) {
                user.grant(POWERS.READ);
            } else {
                user.revoke(POWERS.READ);
            }
        }
    }

    grantUserWrite(idUser: string, idChannel: string): void {
        const channel = this._txat.getChannel(idChannel);
        const user = channel.getUser(idUser);
        if (user) {
            user.grant(POWERS.WRITE);
        }
    }

    revokeUserWrite(idUser: string, idChannel: string): void {
        const channel = this._txat.getChannel(idChannel);
        const user = channel.getUser(idUser);
        if (user) {
            user.revoke(POWERS.WRITE);
        }
    }

    checkUserWrite(idUser: string, idChannel: string): boolean {
        const channel = this._txat.getChannel(idChannel);
        const user = channel.getUser(idUser);
        if (user) {
            return user.hasPower(POWERS.WRITE);
        } else {
            return false;
        }
    }

    postMessage(idSender: string, idChannel: string, message: string) {
        this._txat.postMessage(idSender, idChannel, message);
    }

    registerUser(user: User) {
        const bUserIsStaff =
            user.roles.includes(ROLES.MODERATOR) ||
            user.roles.includes(ROLES.GAME_MASTER) ||
            user.roles.includes(ROLES.ADMIN);
        this._txat.registerUser(user.id, user.displayName);
        for (const cd of this.channelDefinitions.values()) {
            if (cd.staff && !bUserIsStaff) {
                continue;
            }
            if (cd.autojoin) {
                this.joinChannel(user.id, cd.id);
            }
        }
    }

    unregisterUser(user: User) {
        if (this._txat.isUserRegistered(user.id)) {
            this._txat.unregisterUser(user.id);
        }
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

    getUserJoinedChannels(idUser: string): ChannelListItem[] {
        const user = this._txat.getUser(idUser);
        if (user) {
            return Array.from(user.joinedChannels).map((channel) => {
                const userPresence = channel.getUser(idUser);
                if (userPresence) {
                    return {
                        id: channel.id,
                        tag: channel.tag,
                        read: userPresence.hasPower(POWERS.READ),
                        write: userPresence.hasPower(POWERS.WRITE),
                        moderate: userPresence.hasPower(POWERS.MODERATE),
                    };
                } else {
                    throw new Error(
                        `user ${idUser} is not present in channel ${channel.id} as it should be`
                    );
                }
            });
        } else {
            throw new ReferenceError(`user ${idUser} is not registered is chat system`);
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
            await this.sendUserMessage.execute(recv, 'Comm.Channel.Text', {
                [SPECIAL_MESSAGE.GMCP]: {
                    channel: channel.id,
                    talker: sender.name,
                    text: message.content,
                },
            });
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
}
