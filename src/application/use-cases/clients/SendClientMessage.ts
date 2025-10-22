import { Cradle } from '../../../config/container';
import { IStringRepository } from '../../ports/services/IStringRepository';
import { ICommunicationLayer } from '../../ports/services/ICommunicationLayer';
import { ITemplateRepository } from '../../ports/services/ITemplateRepository';
import { JsonObject } from '../../../domain/types/JsonStruct';

/**
 * This use case is used to send a single i18n string to a specific user
 */
export class SendClientMessage {
    private readonly stringRepository: IStringRepository;
    private readonly templateRepository: ITemplateRepository;
    private readonly communicationLayer: ICommunicationLayer;

    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
        this.templateRepository = cradle.templateRepository;
        this.communicationLayer = cradle.communicationLayer;
    }
    async execute(idClient: string, key: string, parameters?: JsonObject) {
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
            sMessage + (parameters?._nolf ? '' : '\n')
        );
    }
}
