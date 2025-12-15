import { UserPresence } from '../UserPresence';
import { Channel } from '../Channel';
import { Message } from '../Message';

export type YouJoinedDto = {
    recv: string;
    channel: Channel;
};
