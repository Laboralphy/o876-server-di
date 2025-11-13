import { Cradle } from '../../../boot/container';
import { ClientContext } from '../../../domain/classes/ClientContext';
import { IIdGenerator } from '../../ports/services/IIdGenerator';
import { IClientContext } from '../../ports/classes/IClientContext';
import { JsonObject } from '../../../domain/types/JsonStruct';
import { DestroyClient } from './DestroyClient';
import { SendClientMessage } from './SendClientMessage';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { ClientSession } from '../../../domain/types/ClientSession';
import { IClientSocket } from '../../../domain/ports/adapters/IClientSocket';
import { CLIENT_STATES } from '../../../domain/enums/client-states';

export class CreateClientSession {
    private readonly idGenerator: IIdGenerator;
    private readonly destroyClient: DestroyClient;
    private readonly sendClientMessage: SendClientMessage;
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.idGenerator = cradle.idGenerator;
        this.destroyClient = cradle.destroyClient;
        this.sendClientMessage = cradle.sendClientMessage;
        this.communicationLayer = cradle.communicationLayer;
    }

    execute(clientSocket: IClientSocket): ClientSession {
        // Create context and associate it with client.
        const idClient = this.idGenerator.generateUID();
        const clientContext = new ClientContext(idClient, {
            onClosingConnection: async (client: string) => {
                return this.destroyClient.execute(client);
            },
            onSendingMessage: (client: string, key: string, parameters?: JsonObject) => {
                return this.sendClientMessage.execute(client, key, parameters);
            },
        });
        const apiContext: IClientContext = {
            getService: clientContext.getService.bind(clientContext),
            getClientId: clientContext.getClientId.bind(clientContext),
            sendMessage: clientContext.sendMessage.bind(clientContext),
            closeConnection: clientContext.closeConnection.bind(clientContext),
            getServerTime: clientContext.getServerTime.bind(clientContext),
        };
        const clientSession: ClientSession = {
            id: idClient,
            state: CLIENT_STATES.LOGIN_PROMPT_USERNAME,
            clientSocket,
            clientContext: apiContext,
            user: null,
            login: '',
        };
        this.communicationLayer.linkClientSession(clientSession);
        return clientSession;
    }
}
