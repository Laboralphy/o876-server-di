import { Channel } from './Channel';
import { EventEmitter } from 'node:events';
import { CHANNEL_ATRIBUTES } from './channel-attributes';
import { POWERS } from './powers';
import { User } from './User';

export class System {
    private readonly channels = new Map<string, Channel>();
    private readonly _events = new EventEmitter();
    private readonly users = new Map<string, User>();

    constructor() {}

    get events(): EventEmitter {
        return this._events;
    }

    /**
     * Adds a new channel to the system
     * @param id channel identifier
     */
    addChannel(id: string): Channel {
        if (!this.channels.has(id)) {
            const channel = new Channel(id);
            channel.events.on('joined', ({ recv }) =>
                this._events.emit('channel.joined', { recv, channel })
            );
            channel.events.on('left', ({ recv }) =>
                this._events.emit('channel.left', { recv, channel })
            );
            channel.events.on('user.joined', ({ recv, user }) =>
                this._events.emit('channel.joined', { recv, channel, user })
            );
            channel.events.on('user.left', ({ recv, user }) => {
                this._events.emit('channel.left', { recv, channel, user });
                if (
                    !channel.attributes.has(CHANNEL_ATRIBUTES.PERSISTANT) &&
                    channel.users.length <= 0
                ) {
                    this.removeChannel(id);
                }
            });
            channel.events.on('message.post', ({ recv, user, message }) =>
                this._events.emit('channel.left', { recv, channel, user, message })
            );
            channel.events.on('closed', ({ recv }) =>
                this._events.emit('channel.left', { recv, channel })
            );
            this.channels.set(id, channel);
            return channel;
        } else {
            throw new Error(`Channel id ${id} already exists`);
        }
    }

    /**
     * Removes a previously created channel from the system
     * @param id channel identifier
     */
    removeChannel(id: string) {
        const channel = this.channels.get(id);
        if (channel) {
            channel.close();
            this.channels.delete(id);
            return channel;
        } else {
            throw new Error(`Channel id ${id} does not exist`);
        }
    }

    /**
     * Returns true if the specified channel id exists
     * @param id channel identifer
     * @return boolean
     */
    isChannelExists(id: string): boolean {
        return this.channels.has(id);
    }

    /**
     * Return a channel instance
     * throws an error if specified identifier does not correspond to a channel
     * @param id
     */
    getChannel(id: string) {
        const channel = this.channels.get(id);
        if (!channel) {
            throw new Error(`Channel id ${id} not found`);
        }
        return channel;
    }

    /**
     * Returns all created channels
     */
    getChannelList() {
        return Array.from(this.channels.values()).filter(
            (channel) => !channel.attributes.has(CHANNEL_ATRIBUTES.HIDDEN)
        );
    }

    userJoinChannel(idUser: string, idChannel: string) {
        const user = this.users.get(idUser);
        if (!user) {
            throw new Error(`User ${idUser} does not exist`);
        }
        const channel = this.getChannel(idChannel);
        if (!channel) {
            throw new Error(`Channel id ${idChannel} does not exist`);
        }
        channel.addUser(idUser).grant(POWERS.READ).grant(POWERS.WRITE);
        user.channelJoined.add(channel);
    }

    userLeaveChannel(idUser: string, idChannel: string) {
        const user = this.users.get(idUser);
        if (!user) {
            throw new Error(`User ${idUser} does not exist`);
        }
        const channel = this.getChannel(idChannel);
        if (!channel) {
            throw new Error(`Channel id ${idChannel} does not exist`);
        }
        channel.removeUser(idUser);
        user.channelJoined.delete(channel);
    }

    registerUser(id: string) {
        const user = new User(id);
        this.users.set(id, user);
    }

    dropUser(idUser: string) {
        // remove this user from all joined channels
        const user = this.users.get(idUser);
        if (!user) {
            throw new Error(`User ${idUser} does not exist`);
        }
        user.channelJoined.forEach((channel) => channel.removeUser(idUser));
        this.users.delete(idUser);
    }
}
