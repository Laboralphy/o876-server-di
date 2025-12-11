import { Channel } from './Channel';

export class User {
    public readonly channelJoined = new Set<Channel>();
    constructor(public readonly id: string) {}
}
