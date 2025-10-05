/**
 * This is the client message receptor function.
 * Called whenever client is sending a message
 */
export interface IClientMessageReceptor {
    (message: string): void | Promise<void>;
}

/**
 * This is the client credential receptor called whenever the client is sending login/password
 */
export interface IClientCredentialReceptor {
    (login: string, password: string): void | Promise<void>;
}

/**
 * This interface is used to implement various type of connection
 * - telnet
 * - websocket
 * - ssh
 * It has function to send messages, receive messages, disconnect session
 */
export interface IClientCommunication {
    /**
     * Sends a message to client
     * @param message message content
     */
    sendMessage(message: string): Promise<void>;

    /**
     * Close client connection
     */
    disconnect(): Promise<void>;

    /**
     * Define a handler to receive client messages
     * @param messageReceptor function receiving client message
     */
    onMessage(messageReceptor: IClientMessageReceptor): void;

    /**
     * Define a handler to receive client credentials
     * @param credential function receiving client credentials
     */
    onCredential(credential: IClientCredentialReceptor): void;
}
