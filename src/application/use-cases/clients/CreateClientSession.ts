import { Cradle } from '../../../boot/container';
import { IIdGenerator } from '../../ports/services/IIdGenerator';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { ClientSession } from '../../../domain/types/ClientSession';
import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';
import { CLIENT_STATES } from '../../../domain/enums/client-states';
import { IApiContextBuilder } from '../../ports/services/IApiContextBuilder';

export class CreateClientSession {
    private readonly idGenerator: IIdGenerator;
    private readonly communicationLayer: ICommunicationLayer;
    private readonly apiContextBuilder: IApiContextBuilder;

    constructor(cradle: Cradle) {
        this.idGenerator = cradle.idGenerator;
        this.communicationLayer = cradle.communicationLayer;
        this.apiContextBuilder = cradle.apiContextBuilder;
    }

    execute(clientSocket: IClientSocket): ClientSession {
        // Create context and associate it with client.
        const idClient = this.idGenerator.generateUID();
        const clientSession: ClientSession = {
            id: idClient,
            state: CLIENT_STATES.LOGIN,
            clientSocket,
            clientContext: this.apiContextBuilder.buildApiContext(idClient),
            user: null,
            login: '',
            processRegistry: new Map(),
        };
        this.communicationLayer.linkClientSession(clientSession);
        return clientSession;
    }
}
