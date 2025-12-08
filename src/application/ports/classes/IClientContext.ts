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
     * Close client connection to server.
     */
    closeConnection(): Promise<void>;

    /**
     * Gets information about server time.
     * now: The current timestamp
     * timezone: An iso string describing the timezone where the server is located at
     * moon: Various astronomic data about the moon phase and age
     * moon.age: lunar periodic age (in days)
     * moon.glyph: a unicode character matching the current moon phase
     * moon.label: an i18n string describing moon phase.
     */
    getServerTime(): {
        now: number;
        timezone: string;
        moon: { age: string; glyph: string; label: string };
    };
}
