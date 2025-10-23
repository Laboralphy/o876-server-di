import { IClientContextService } from './IClientContextService';
import { IClientSocket } from '../../domain/ports/adapters/IClientSocket';

export class ClientContext {
    readonly #clientSocket: IClientSocket;
    private readonly services: Map<string, IClientContextService> = new Map();

    constructor(socket: IClientSocket) {
        this.#clientSocket = socket;
    }

    getService(name: string): IClientContextService {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not registered`);
        }
        return service;
    }
}
