import { IClientRepository } from '../../../application/ports/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { ForEachCallback } from '../../../domain/ports/IDatabaseAdapter';

export class ClientRepository implements IClientRepository {
    private clients = new Map<string, Client>();
    constructor() {}

    delete(entity: Client): Promise<void> {
        this.clients.delete(entity.id);
        return Promise.resolve(undefined);
    }

    forEach(callback: ForEachCallback<Client>): Promise<void> {
        for (const [key, value] of this.clients.entries()) {
            callback(value, key);
        }
        return Promise.resolve(undefined);
    }

    get(key: string): Promise<Client | undefined> {
        return Promise.resolve(this.clients.get(key));
    }

    save(entity: Client): Promise<Client> {
        this.clients.set(entity.id, entity);
        return Promise.resolve(entity);
    }
}
