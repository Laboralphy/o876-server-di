import { Cradle } from '../../../boot/container';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';

/**
 * This use case destroys a registered client, because its connection has been close.
 * Do not destroy a client whose connection is still active.
 * Same as CreateClient is called in reaction of a new client connection
 * DestroyClient is called in reaction of a client being disconnected
 */
export class DestroyClient {
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
    }

    execute(idClient: string): void {
        // If this use case is initiated by the server, then the client socket dropping will certainly
        // trigger the use case a second time, but as the client will be dropped, nothing serious will occur.
        this.communicationLayer.dropClient(idClient);
    }
}
