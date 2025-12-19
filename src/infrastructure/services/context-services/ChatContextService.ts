import { IChatManager } from '../../../application/ports/services/IChatManager';
import { ClientCradle } from '../../../boot/container';
import { AbstractContextService } from './AbstractContextService';

export class ChatContextService extends AbstractContextService {
    private readonly chatManager: IChatManager;

    constructor(cradle: ClientCradle) {
        super(cradle);
        this.chatManager = cradle.chatManager;
    }

    joinChannel(idChannel: string) {
        this.chatManager.joinChannel(this.user.id, idChannel);
    }

    postMessage(idChannel: string, message: string) {
        this.chatManager.postMessage(this.user.id, idChannel, message);
    }
}
