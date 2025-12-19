import { MailContextService } from '../../../infrastructure/services/context-services/MailContextService';
import { UserContextService } from '../../../infrastructure/services/context-services/UserContextService';
import { ChatContextService } from '../../../infrastructure/services/context-services/ChatContextService';

export type IClientContextServices = {
    mail: MailContextService;
    user: UserContextService;
    chat: ChatContextService;
};
