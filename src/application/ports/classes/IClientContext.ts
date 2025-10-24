import { IClientContextService } from './IClientContextService';
import { JsonObject } from '../../../domain/types/JsonStruct';

export interface IClientContext {
    /**
     * Sends a message to client.
     * The message content is usually a string reference or a template reference.
     * It is strongly recommended to use i18n for translatable text, and template to colorized or stylized
     * content.
     * @param key message content, or a i18n string reference, or hbs template
     * @param parameters a plain object used to replace variables in i18n string or hbs template
     * @async
     */
    sendMessage(key: string, parameters?: JsonObject): void;

    /**
     * Close client connection to server.
     */
    closeConnection(): void;

    getService(name: string): IClientContextService;
}
