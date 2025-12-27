import { IChatManager } from '../../../application/ports/services/IChatManager';
import { ClientCradle } from '../../../boot/container';
import { AbstractContextService } from './AbstractContextService';
import { ROLES } from '../../../domain/enums/roles';

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
        // check if user has post right
        if (this.chatManager.checkUserWrite(this.user.id, idChannel)) {
            this.chatManager.postMessage(this.user.id, idChannel, message);
        } else {
            // some user privileges allow user to write on readonly channel
            const roles = new Set(this.user.roles);
            if (
                roles.has(ROLES.ADMIN) ||
                roles.has(ROLES.MODERATOR) ||
                roles.has(ROLES.GAME_MASTER) ||
                roles.has(ROLES.SERVICE)
            ) {
                // quickly grant write power
                this.chatManager.grantUserWrite(this.user.id, idChannel);
                this.chatManager.postMessage(this.user.id, idChannel, message);
            }
        }
    }

    getChannelList() {
        return this.chatManager.getUserJoinedChannels(this.user.id);
    }

    isChannelActive(idChannel: string): boolean {
        const channels = this.getChannelList();
        const channel = channels.find((channel) => channel.id === idChannel);
        if (channel) {
            return channel.read;
        } else {
            throw new ReferenceError(`Unknown channel id ${idChannel}`);
        }
    }

    switchChannel(idChannel: string, value: boolean) {
        const channels = this.getChannelList();
        const channel = channels.find((channel) => channel.id === idChannel);
        if (channel) {
            this.chatManager.switchChannel(this.user.id, idChannel, value);
        }
    }
}
