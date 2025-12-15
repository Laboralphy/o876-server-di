import { UserPresence } from '../UserPresence';
import { Channel } from '../Channel';
import { Message } from '../Message';

export type YouLeftDto = {
    recv: string;
    channel: Channel;
};
