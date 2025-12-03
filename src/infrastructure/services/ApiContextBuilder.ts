import { IApiContextBuilder } from '../../application/ports/services/IApiContextBuilder';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { JsonObject } from '../../domain/types/JsonStruct';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { Cradle } from '../../boot/container';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { getMoonPhase } from '../../libs/moon-phase';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { SetUserPassword } from '../../application/use-cases/user-secrets/SetUserPassword';
import { User } from '../../domain/entities/User';
import { FindUser } from '../../application/use-cases/users/FindUser';
import { GetUserList } from '../../application/use-cases/users/GetUserList';
import { container } from '../../boot/container';
import { debug } from '../../libs/o876-debug';
import { asValue } from 'awilix';

const debugCtx = debug('srv:apictx');

export interface ScopedCradle extends Cradle {
    idClient: string;
}

export class ApiContextBuilder implements IApiContextBuilder {
    private sendClientMessage: SendClientMessage;
    private destroyClient: DestroyClient;
    private communicationLayer: ICommunicationLayer;
    // users
    private findUser: FindUser;
    private getUserList: GetUserList;

    constructor(cradle: Cradle) {
        // use cases
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;
        // users
        this.findUser = cradle.findUser;
        this.getUserList = cradle.getUserList;

        // services
        this.communicationLayer = cradle.communicationLayer;
    }

    getClientSession(idClient: string) {
        const clientSession = this.communicationLayer.getClientSession(idClient);
        if (!clientSession) {
            throw new Error(`client ${idClient} has no clientSession`);
        }
        return clientSession;
    }

    buildApiContext(idClient: string): IClientContext {
        const print = (key: string, parameters?: JsonObject): Promise<void> => {
            return this.sendClientMessage.execute(idClient, key, parameters);
        };
        const scope = container.createScope<ScopedCradle>();
        scope.register('idClient', asValue(idClient));

        let closingClient: boolean = false;

        debugCtx('building client context for %s', idClient);

        const cmdContext: IClientContext = {
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/

            print,

            closeConnection: async () => {
                if (!closingClient) {
                    closingClient = true;
                    await scope.dispose();
                    debugCtx('disposing client %s context', idClient);
                    this.destroyClient.execute(idClient);
                }
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

            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/

            mail: scope.resolve('mailContextService'),
            user: scope.resolve('userContextService'),
        };
        return cmdContext;
    }
}
