import { UserPresence } from '../UserPresence';
import { Channel } from '../Channel';
import { Message } from '../Message';

export type ChannelJoinedDto = {
    recv: string;
    channel: Channel;
    user: UserPresence;
};
