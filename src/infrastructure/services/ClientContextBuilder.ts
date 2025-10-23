import { ExtensibleContext } from '../client-context/ExtensibleContext';
import { JsonObject } from '../../domain/types/JsonStruct';
import { Cradle } from '../../config/container';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';

/**
 * This class is used by the use-case application layer to easily perform low level network operations
 * regardless of the type of socket owned by the user.
 * The use cases must be agnostic of the socket type.
 */
export class ClientContextBuilder {
    constructor(cradle: Cradle) {}

    buildClientContext(id: string): ExtensibleContext {
        const context = new ExtensibleContext();
        context.registerExtension('default', {
            /**
             * Sends a message to client.
             * The message content is usually a string reference or a template reference.
             * It is strongly recommended to use i18n for translatable text, and template to colorized or stylized
             * content.
             * @param key message content, or a i18n string reference, or hbs template
             * @param parameters a plain object used to replace variables in i18n string or hbs template
             * @async
             */
            sendMessage: async (key: string, parameters: JsonObject = {}): Promise<void> => {
                return this.sendClientMessage.execute(id, key, parameters);
            },

            /**
             * Close client connection to server.
             */
            closeConnection: (): void => {
                this.destroyClient.execute(id);
            },
        });
        return context;
    }
}
