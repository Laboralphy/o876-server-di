import { MailContextService } from '../../../infrastructure/services/context-services/MailContextService';
import { UserContextService } from '../../../infrastructure/services/context-services/UserContextService';
import { ChatContextService } from '../../../infrastructure/services/context-services/ChatContextService';
import { TimeContextService } from '../../../infrastructure/services/context-services/TimeContextService';
import { GmcpContextService } from '../../../infrastructure/services/context-services/GmcpContextService';

export type IClientContextServices = {
    mail: MailContextService;
    user: UserContextService;
    chat: ChatContextService;
    time: TimeContextService;
    gmcp: GmcpContextService;
};
