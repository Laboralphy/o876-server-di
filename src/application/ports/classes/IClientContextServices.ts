import { MailContextService } from '../../../infrastructure/services/context-services/MailContextService';
import { UserContextService } from '../../../infrastructure/services/context-services/UserContextService';

export type IClientContextServices = {
    mail: MailContextService;
    user: UserContextService;
};
