import { Cradle } from '../../boot/container';
import { IChatManager } from '../ports/services/IChatManager';

export class ChatJoinChannel {
    private readonly chatManager: IChatManager;
    constructor(cradle: Cradle) {
        this.chatManager = cradle.chatManager;
    }
    execute(idUser: string, idChannel: string) {
        this.chatManager.joinChannel(idUser, idChannel);
    }
}
