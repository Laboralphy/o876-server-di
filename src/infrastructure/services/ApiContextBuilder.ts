import { IApiContextBuilder } from '../../application/ports/services/IApiContextBuilder';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { JsonObject } from '../../domain/types/JsonStruct';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { ClientCradle } from '../../boot/container';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { getMoonPhase } from '../../libs/moon-phase';
import { debug } from '../../libs/o876-debug';
import { MailContextService } from './context-services/MailContextService';
import { UserContextService } from './context-services/UserContextService';
import { ChatContextService } from './context-services/ChatContextService';

const debugCtx = debug('srv:apictx');

export class ApiContextBuilder implements IApiContextBuilder {
    private readonly sendClientMessage: SendClientMessage;
    private readonly destroyClient: DestroyClient;
    private readonly idClient: string;
    private readonly mailContextService: MailContextService;
    private readonly userContextService: UserContextService;
    private readonly chatContextService: ChatContextService;

    constructor(cradle: ClientCradle) {
        // use cases
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;

        this.idClient = cradle.idClient;
        debugCtx('building new instance of ApiContextBuilder for client %s', this.idClient);

        // context services
        this.mailContextService = cradle.mailContextService;
        this.userContextService = cradle.userContextService;
        this.chatContextService = cradle.chatContextService;
    }

    buildApiContext(): IClientContext {
        const idClient = this.idClient;
        const print = (key: string, parameters?: JsonObject): Promise<void> => {
            return this.sendClientMessage.execute(idClient, key, parameters);
        };

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
                    this.destroyClient.execute(idClient);
                }
            },

            getServerTime: () => {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const date = new Date();
                const now = date.getTime();
                const moon = getMoonPhase(date);
                return {
                    now,
                    timezone,
                    moon,
                };
            },

            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/

            mail: this.mailContextService,
            user: this.userContextService,
            chat: this.chatContextService,
        };
        return cmdContext;
    }
}
