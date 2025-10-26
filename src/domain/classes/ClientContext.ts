import { IClientContextService } from '../../application/ports/classes/IClientContextService';
import { JsonObject } from '../types/JsonStruct';
import { IClientContext } from '../../application/ports/classes/IClientContext';

export interface SendingClientMessageHandler {
    (client: string, key: string, parameters?: JsonObject): Promise<void>;
}

export interface ClosingClientConnectionHandler {
    (client: string): void;
}

export type ClientContextHandlers = {
    onSendingMessage: SendingClientMessageHandler;
    onClosingConnection: ClosingClientConnectionHandler;
};

export class ClientContext implements IClientContext {
    static readonly #services: Map<string, IClientContextService> = new Map();

    constructor(
        private readonly idClient: string,
        private readonly handlers: ClientContextHandlers
    ) {}

    getClientId(): string {
        return this.idClient;
    }

    /**
     * Sends a message to client.
     * The message content is usually a string reference or a template reference.
     * It is strongly recommended to use i18n for translatable text, and template to colorized or stylized
     * content.
     * @param key message content, or a i18n string reference, or hbs template
     * @param parameters a plain object used to replace variables in i18n string or hbs template
     * @async
     */
    async sendMessage(key: string, parameters?: JsonObject): Promise<void> {
        return this.handlers.onSendingMessage(this.idClient, key, parameters);
    }

    /**
     * Close client connection to server.
     */
    closeConnection() {
        this.handlers.onClosingConnection(this.idClient);
    }

    static addService(service: IClientContextService) {
        ClientContext.#services.set(service.getName(), service);
    }

    getService(name: string): IClientContextService {
        const service = ClientContext.#services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not registered`);
        }
        return service;
    }

    getServerTime(): { date: Date; timezone: string } {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const date = new Date();
        return {
            date,
            timezone,
        };
    }
}
