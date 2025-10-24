import { Cradle } from '../../../config/container';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { IClientContext } from '../../ports/classes/IClientContext';

export class CreateClientContext {
    private readonly communicationLayer: ICommunicationLayer;
    private readonly ClientContext: IClientContext;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
        this.ClientContext = cradle.ClientContext;
    }

    execute(idClient: string): void {
        // Create context and associate it with client.
        return new this.ClientContext(idClient);
    }
}
