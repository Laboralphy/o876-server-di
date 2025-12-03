import { User } from '../../../domain/entities/User';
import { ClientSession } from '../../../domain/types/ClientSession';
import { ICommunicationLayer } from '../../../application/ports/services/ICommunicationLayer';
import { ScopedCradle } from '../ApiContextBuilder';

export abstract class AbstractContextService {
    private readonly communicationLayer: ICommunicationLayer;
    protected readonly idClient: string;

    protected constructor(cradle: ScopedCradle) {
        this.communicationLayer = cradle.communicationLayer;
        this.idClient = cradle.idClient;
    }

    get clientSession(): ClientSession {
        return this.communicationLayer.getClientSession(this.idClient);
    }

    get user(): User {
        if (this.clientSession.user) {
            return this.clientSession.user;
        } else {
            throw new Error('Client is not associated with an identified user');
        }
    }
}
