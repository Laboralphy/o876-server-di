import { Cradle } from '../../../boot/container';
import { IStringRepository } from '../../ports/services/IStringRepository';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { ITemplateRepository } from '../../ports/services/ITemplateRepository';
import { JsonObject, JsonValue } from '../../../domain/types/JsonStruct';
import { SPECIAL_MESSAGE } from '../../../domain/enums/special-message';
import { IGMCPGateway } from '../../ports/services/IGMCPGateway';

/**
 * This use case is used to send a single i18n string to a specific user
 */
export class SendClientMessage {
    private readonly stringRepository: IStringRepository;
    private readonly templateRepository: ITemplateRepository;
    private readonly communicationLayer: ICommunicationLayer;
    private readonly gmcpGateway: IGMCPGateway;

    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
        this.templateRepository = cradle.templateRepository;
        this.communicationLayer = cradle.communicationLayer;
        this.gmcpGateway = cradle.gmcpGateway;
    }

    executeGMCP(idClient: string, opcode: string, body: JsonValue) {
        const data = this.gmcpGateway.buildGMCPData(opcode, body);
        return this.communicationLayer.sendMessage(idClient, data);
    }

    async execute(idClient: string, key: string, parameters?: JsonObject) {
        if (parameters && SPECIAL_MESSAGE.GMCP in parameters) {
            return this.executeGMCP(idClient, key, parameters[SPECIAL_MESSAGE.GMCP] as JsonValue);
        }
        const sTemplateRendered = this.templateRepository.render(key, parameters);
        if (sTemplateRendered !== undefined) {
            for (const sLine of sTemplateRendered.split('\n')) {
                await this.communicationLayer.sendMessage(idClient, sLine + '\n');
            }
            return;
        }
        const sMessage = this.stringRepository.render(key, parameters);
        await this.communicationLayer.sendMessage(
            idClient,
            sMessage + (parameters && parameters[SPECIAL_MESSAGE.NOLF] ? '' : '\n')
        );
    }
}
