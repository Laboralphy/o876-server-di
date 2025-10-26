interface JsonObject {
    [key: string]: any;
}

interface IClientContextService {
    getName(): string;
}

interface IClientContext {
    /**
     * Returns the client id.
     */
    getClientId(): string;

    /**
     * Sends a message to client.
     * The message content is usually a string reference or a template reference.
     * It is strongly recommended to use i18n for translatable text, and template for colorized or stylized content.
     * @param key Message content, or a i18n string reference, or hbs template.
     * @param parameters A plain object used to replace variables in i18n string or hbs template.
     */
    sendMessage(key: string, parameters?: JsonObject): Promise<void>;

    /**
     * Close client connection to server.
     */
    closeConnection(): void;

    /**
     * Get a service by name.
     */
    getService(name: string): IClientContextService;
}

declare const context: IClientContext;
