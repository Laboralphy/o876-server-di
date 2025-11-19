import { IApiContextBuilder } from '../../application/ports/services/IApiContextBuilder';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { JsonObject } from '../../domain/types/JsonStruct';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { Cradle } from '../../boot/container';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { getMoonPhase } from '../../libs/moon-phase';

export class ApiContextBuilder implements IApiContextBuilder {
    private sendClientMessage: SendClientMessage;
    private destroyClient: DestroyClient;

    constructor(cradle: Cradle) {
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;
    }

    buildApiContext(idClient: string): IClientContext {
        const apiContext: IClientContext = {
            getClientId: () => idClient,
            sendMessage: (key: string, parameters?: JsonObject): Promise<void> => {
                return this.sendClientMessage.execute(idClient, key, parameters);
            },
            closeConnection: () => {
                return this.destroyClient.execute(idClient);
            },
            getServerTime: () => {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const date = new Date();
                const moon = getMoonPhase(date);
                return {
                    date,
                    timezone,
                    moon,
                };
            },
        };
        return apiContext;
    }
}
