import { Cradle } from '../../../boot/container';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { ClientSession } from '../../../domain/types/ClientSession';
import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';
import { CLIENT_STATES } from '../../../domain/enums/client-states';
import { IApiContextBuilder } from '../../ports/services/IApiContextBuilder';
import { IClientContext } from '../../ports/classes/IClientContext';

export class RegisterClient {
    private readonly communicationLayer: ICommunicationLayer;
    private readonly apiContextBuilder: IApiContextBuilder;

    constructor(cradle: Cradle) {
        this.communicationLayer = cradle.communicationLayer;
        this.apiContextBuilder = cradle.apiContextBuilder;
    }

    execute(
        idClient: string,
        clientSocket: IClientSocket,
        clientContext: IClientContext
    ): ClientSession {
        // Create context and associate it with client.
        const clientSession: ClientSession = {
            id: idClient,
            state: CLIENT_STATES.LOGIN,
            clientSocket,
            clientContext,
            user: null,
            login: '',
        };
        this.communicationLayer.linkClientSession(clientSession);
        return clientSession;
    }
}
