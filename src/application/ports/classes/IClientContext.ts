import { JsonObject } from '../../../domain/types/JsonStruct';
import { CheckMailInboxEntry } from '../../use-cases/mail/CheckMailInbox';

export interface IClientContext {
    /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
    /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
    /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/

    /**
     * returns the client id
     */
    getClientId(): string;

    /**
     * Asynchronous method !
     * Sends a message to client.
     * The message content is usually a string reference or a template reference.
     * It is strongly recommended to use i18n for translatable text, and template to colorized or stylized
     * content.
     * @param key message content, or a i18n string reference, or hbs template
     * @param parameters a plain object used to replace variables in i18n string or hbs template
     */
    sendMessage(key: string, parameters?: JsonObject): Promise<void>;

    /**
     * Close client connection to server.
     */
    closeConnection(): void;

    /**
     * Gets information about server time.
     * date: The date now
     * timezone: An iso string describing the timezone where the server is located at
     * moon: Various astronomic data about the moon phase and age
     * moon.age: lunar periodic age (in days)
     * moon.glyph: a unicode character matching the current moon phase
     * moon.label: an i18n string describing moon phase.
     */
    getServerTime(): {
        date: Date;
        timezone: string;
        moon: { age: string; glyph: string; label: string };
    };

    /**
     * Change user password. Either interactively or with parameters.
     * @param newPassword
     * @param currentPassword
     * if passwords are specified (both new and current), the method will attempt to change the
     * user password. The operation will fail if currentPassword does not match the user's current password.
     * if no password is specified, the client is supposed to enter a "changePasswordProcess"
     * That's mean that an interactive process will occur and the user will be invited to enter
     * its current password, then a new password, and then confirm this new password.
     */
    changePassword(newPassword?: string, currentPassword?: string): Promise<void>;

    /****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ******/
    /****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ******/
    /****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ******/

    /**
     * Returns information about user mail inbox
     */
    mailCheckInbox(): Promise<CheckMailInboxEntry[]>;

    mailSendMessage(recipientNames: string, content: string): Promise<void>;
}
