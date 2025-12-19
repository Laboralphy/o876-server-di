import { Cradle } from '../../../boot/container';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { IChatManager } from '../../ports/services/IChatManager';

/**
 * This use case destroys a registered client, because its connection has been close.
 * Do not destroy a client whose connection is still active.
 * Same as CreateClient is called in reaction of a new client connection
 * DestroyClient is called in reaction of a client being disconnected
 */
export class DestroyClient {
    private readonly communicationLayer: ICommunicationLayer;
    private readonly chatManager: IChatManager;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
        this.chatManager = cradle.chatManager;
    }

    execute(idClient: string): void {
        // If this use case is initiated by the server, then the client socket dropping will certainly
        // trigger the use case a second time, but as the client will be dropped, nothing serious will occur.
        const cs = this.communicationLayer.getClientSession(idClient);
        const user = cs.user;
        if (user) {
            if (this.chatManager) {
            }
            this.chatManager.unregisterUser(user);
        }
        this.communicationLayer.dropClient(idClient);
    }
}
