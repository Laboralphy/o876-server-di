import { EventEmitter } from 'node:events';
import { UserPresence } from './UserPresence';
import { POWERS } from './powers';
import { Message } from './Message';

export class Channel {
    private readonly users = new Map<string, UserPresence>();
    private readonly messages: Message[] = [];
    private readonly _events = new EventEmitter();
    public maxLines: number = 1000;
    public readonly whiteList = new Set<string>();
    public readonly blackList = new Set<string>();

    constructor(
        public readonly id: string,
        public readonly name: string
    ) {}

    get events(): EventEmitter {
        return this._events;
    }

    get isRestricted(): boolean {
        return this.whiteList.size > 0;
    }

    /**
     * Adds a new user to this channel
     * This user will now be able to read channel content, and, if granted, write messages
     * @param idUser
     * @return UserPresence the instance of user presence is return so another system may
     * update this instance to reflect user privileges on this channel
     */
    linkUser(idUser: string) {
        const user = this.users.get(idUser);
        if (user) {
            return user;
        } else {
            if (this.blackList.has(idUser) || (this.isRestricted && !this.whiteList.has(idUser))) {
                throw new Error(`User ${idUser} is not allowed to access this channel.`);
            }
            const user = new UserPresence(idUser);
            this.events.emit('joined', { recv: idUser });
            this.users.forEach((u: UserPresence) => {
                this.events.emit('user.joined', { recv: u.id, user });
            });
            this.users.set(idUser, user);
            return user;
        }
    }

    /**
     * Remove user presence from this channel
     * @param idUser
     * @return UserPresence client app should store this objet to keep track of user
     * privileges on this channel
     */
    unlinkUser(idUser: string) {
        const user = this.users.get(idUser);
        if (user) {
            this.users.delete(idUser);
            this.events.emit('left', { recv: idUser });
            this.users.forEach((u: UserPresence) => {
                this.events.emit('user.left', { recv: u.id, user });
            });
        }
        return user;
    }

    postMessage(idUser: string, content: string): boolean {
        const user = this.users.get(idUser);
        if (user && user.hasPower(POWERS.WRITE)) {
            const message = new Message(idUser, content, Date.now());
            while (this.messages.length >= this.maxLines) {
                this.messages.shift();
            }
            this.messages.push(message);
            this.users.delete(idUser);
            Array.from(this.users.values())
                .filter((u: UserPresence) => u.hasPower(POWERS.READ))
                .forEach((u: UserPresence) => {
                    this.events.emit('message.post', {
                        recv: u.id,
                        user,
                        message,
                    });
                });
            return true;
        } else {
            return false;
        }
    }

    close() {
        this.users.forEach((u: UserPresence) => {
            this.events.emit('closed', {
                recv: u.id,
            });
        });
    }

    getMessages(nTail: number = -Infinity) {
        return this.messages.slice(-nTail);
    }
}
