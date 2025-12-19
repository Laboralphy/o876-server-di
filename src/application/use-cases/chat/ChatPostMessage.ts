import { Cradle } from '../../../boot/container';
import { IChatManager } from '../../ports/services/IChatManager';

export class ChatPostMessage {
    private readonly chatManager: IChatManager;
    constructor(cradle: Cradle) {
        this.chatManager = cradle.chatManager;
    }
    execute(idUser: string, idChannel: string, message: string) {
        this.chatManager.postMessage(idUser, idChannel, message);
    }
}
