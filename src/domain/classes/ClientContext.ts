import { IClientContextService } from '../../application/ports/classes/IClientContextService';
import { EventEmitter } from 'events';
import { JsonObject } from '../types/JsonStruct';
import { IClientContext } from '../../application/ports/classes/IClientContext';

export class ClientContext implements IClientContext {
    static readonly #services: Map<string, IClientContextService> = new Map();
    readonly #events = new EventEmitter();

    constructor(private readonly idClient: string) {}

    /**
     * Sends a message to client.
     * The message content is usually a string reference or a template reference.
     * It is strongly recommended to use i18n for translatable text, and template to colorized or stylized
     * content.
     * @param key message content, or a i18n string reference, or hbs template
     * @param parameters a plain object used to replace variables in i18n string or hbs template
     * @async
     */
    sendMessage(key: string, parameters?: JsonObject) {
        this.#events.emit('message', { client: this.idClient, key, parameters });
    }

    /**
     * Close client connection to server.
     */
    closeConnection() {
        this.#events.emit('close', { client: this.idClient });
    }

    getService(name: string): IClientContextService {
        const service = ClientContext.#services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not registered`);
        }
        return service;
    }
}
