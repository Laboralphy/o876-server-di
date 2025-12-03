import { MailContextService } from '../../../infrastructure/services/context-services/MailContextService';

export type IClientContextServices = {
    mail: MailContextService;
};
