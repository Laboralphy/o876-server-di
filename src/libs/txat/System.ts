import { Channel } from './Channel';
import { EventEmitter } from 'node:events';

export class System {
    private readonly channels = new Map<string, Channel>();
    private readonly _events = new EventEmitter();

    constructor() {}

    get events(): EventEmitter {
        return this._events;
    }

    addChannel(id: string, name: string): Channel {
        if (!this.channels.has(id)) {
            const channel = new Channel(id, name);
            channel.events.on('joined', ({ recv }) =>
                this._events.emit('channel.joined', { recv, channel })
            );
            channel.events.on('left', ({ recv }) =>
                this._events.emit('channel.left', { recv, channel })
            );
            channel.events.on('user.joined', ({ recv, user }) =>
                this._events.emit('channel.joined', { recv, channel, user })
            );
            channel.events.on('user.left', ({ recv, user }) =>
                this._events.emit('channel.left', { recv, channel, user })
            );
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

    isChannelExists(id: string): boolean {
        return this.channels.has(id);
    }

    getChannel(id: string) {
        const channel = this.channels.get(id);
        if (!channel) {
            throw new Error(`Channel id ${id} not found`);
        }
        return channel;
    }
}
