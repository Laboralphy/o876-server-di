import { Cradle } from '../../../config/container';
import { IStringRepository } from '../../ports/services/IStringRepository';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { ICommunicationManager } from '../../ports/services/ICommunicationManager';
import { ITemplateRepository } from '../../ports/services/ITemplateRepository';
import { JsonObject } from '../../../domain/types/JsonStruct';

/**
 * This use case is used to send a single i18n string to a specific user
 */
export class SendClientString {
    private readonly stringRepository: IStringRepository;
    private readonly templateRepository: ITemplateRepository;
    private readonly communicationLayer: ICommunicationManager;

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
