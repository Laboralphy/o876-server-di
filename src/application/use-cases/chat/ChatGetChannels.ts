import { IChatManager } from '../../ports/services/IChatManager';
import { Cradle } from '../../../boot/container';

export class ChatGetChannels {
    private readonly chatManager: IChatManager;
    constructor(cradle: Cradle) {
        this.chatManager = cradle.chatManager;
    }
    execute(idUser: string) {
        return this.chatManager.getUserJoinedChannels(idUser);
    }
}
