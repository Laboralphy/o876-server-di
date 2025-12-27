import { JsonObject } from '../../../domain/types/JsonStruct';
import { IClientContextServices } from './IClientContextServices';

export interface IClientContext extends IClientContextServices {
    /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
    /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
    /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
    /**
     * Asynchronous method !
     * Sends a message to client.
     * The message content is usually a string reference or a template reference.
     * It is strongly recommended to use i18n for translatable text, and template to colorized or stylized
     * content.
     * @param key message content, or a i18n string reference, or hbs template
     * @param parameters a plain object used to replace variables in i18n string or hbs template
     */
    print(key: string, parameters?: JsonObject): Promise<void>;

    /**
     * Synchronous call
     * Fetch the string referenced by the "key" parameter.
     * @param key string reference
     * @param parameters i18n completion object
     */
    strref(key: string, parameters?: JsonObject): string;

    get commandNames(): string[];

    /**
     * Close client connection to server.
     */
    closeConnection(): Promise<void>;
}
