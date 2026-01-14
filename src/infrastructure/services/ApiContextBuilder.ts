import { IApiContextBuilder } from '../../application/ports/services/IApiContextBuilder';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { JsonObject } from '../../domain/types/JsonStruct';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { ClientCradle } from '../../boot/container';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { debug } from '../../libs/o876-debug';
import { MailContextService } from './context-services/MailContextService';
import { UserContextService } from './context-services/UserContextService';
import { ChatContextService } from './context-services/ChatContextService';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { TimeContextService } from './context-services/TimeContextService';
import { IScriptRunner } from '../../application/ports/services/IScriptRunner';
import { GmcpContextService } from './context-services/GmcpContextService';

const debugCtx = debug('srv:apictx');

export class ApiContextBuilder implements IApiContextBuilder {
    private readonly sendClientMessage: SendClientMessage;
    private readonly destroyClient: DestroyClient;
    private readonly idClient: string;
    private readonly stringRepository: IStringRepository;
    private readonly scriptRunner: IScriptRunner;

    private readonly mailContextService: MailContextService;
    private readonly userContextService: UserContextService;
    private readonly chatContextService: ChatContextService;
    private readonly timeContextService: TimeContextService;
    private readonly gmcpContextService: GmcpContextService;

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
        this.timeContextService = cradle.timeContextService;
        this.gmcpContextService = cradle.gmcpContextService;

        // repositories
        this.stringRepository = cradle.stringRepository;

        // services
        this.scriptRunner = cradle.scriptRunner;
    }

    buildApiContext(): IClientContext {
        const idClient = this.idClient;

        const strref = (key: string, parameters?: JsonObject): string => {
            return this.stringRepository.render(key, parameters);
        };

        const print = (
            key: string,
            parameters?: JsonObject
        ): Promise<{
            locale: boolean;
            template: boolean;
            gmcp: boolean;
            sent: boolean;
        }> => {
            return this.sendClientMessage.execute(idClient, key, parameters);
        };

        const aCommandNames: string[] = this.scriptRunner.scriptNames
            .filter((c) => c.startsWith('commands/'))
            .map((c) => c.substring(9));

        let closingClient: boolean = false;

        debugCtx('building client context for %s', idClient);

        const cmdContext: IClientContext = {
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/

            print,
            debug: debugCtx,
            strref,

            get commandNames() {
                return aCommandNames;
            },

            closeConnection: async () => {
                if (!closingClient) {
                    closingClient = true;
                    this.destroyClient.execute(idClient);
                }
            },

            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/
            /****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ****** API CONTEXT SERVICES ******/

            mail: this.mailContextService,
            user: this.userContextService,
            chat: this.chatContextService,
            time: this.timeContextService,
            gmcp: this.gmcpContextService,
        };
        return cmdContext;
    }
}
