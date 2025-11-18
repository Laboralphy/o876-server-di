import { IClientContextService } from '../../ports/classes/IClientContextService';
import { ClientContext } from '../../../domain/classes/ClientContext';

export class DeclareService {
    execute(service: IClientContextService) {
        ClientContext.addService(service);
    }
}
