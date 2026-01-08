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

    async execute(
        idClient: string,
        key: string,
        parameters?: JsonObject
    ): Promise<{ locale: boolean; template: boolean; gmcp: boolean; sent: boolean }> {
        if (parameters && SPECIAL_MESSAGE.GMCP in parameters) {
            if (
                this.communicationLayer
                    .getClientSession(idClient)
                    .clientContext.gmcp.isPackageSupported(key)
            ) {
                await this.executeGMCP(
                    idClient,
                    key,
                    parameters[SPECIAL_MESSAGE.GMCP] as JsonValue
                );
                return {
                    // This GMCP package is supported by the client
                    locale: false,
                    template: false,
                    gmcp: true,
                    sent: true,
                };
            } else {
                return {
                    // This GMCP package is not supported by the client thus, was not delivered
                    // We should try the telnet way
                    locale: false,
                    template: false,
                    gmcp: true,
                    sent: false,
                };
            }
        }
        const sTemplateRendered = this.templateRepository.render(key, parameters);
        if (sTemplateRendered !== undefined) {
            for (const sLine of sTemplateRendered.split('\n')) {
                await this.communicationLayer.sendMessage(idClient, sLine + '\n');
            }
            return {
                // This is a regular template
                locale: false,
                template: true,
                gmcp: false,
                sent: true,
            };
        }
        const sMessage = this.stringRepository.render(key, parameters);
        await this.communicationLayer.sendMessage(
            idClient,
            sMessage + (parameters && parameters[SPECIAL_MESSAGE.NOLF] ? '' : '\n')
        );
        return {
            // This is a regular locale string
            locale: true,
            template: false,
            gmcp: false,
            sent: true,
        };
    }
}
