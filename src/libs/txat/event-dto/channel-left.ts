import { UserPresence } from '../UserPresence';
import { Channel } from '../Channel';
import { Message } from '../Message';

export type ChannelLeftDto = {
    recv: string;
    channel: Channel;
    user: UserPresence;
};
