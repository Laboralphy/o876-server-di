/**
 * Will be used to handle socket of different protocol (websocket, ssh, telnet...)
 */
export interface IClientSocket {
    /**
     * Sends a message to the client
     * @param message
     */
    send(message: string | Buffer): Promise<void>;

    /**
     * Listen to message from client
     * @param callback
     */
    onMessage(callback: (message: string) => void): void;

    /**
     * Listen to disconnect events.
     * This method is used to normalize disconnecting event
     * (we don't know what type of event are fired when the socket is shutdown
     * @param callback
     */
    onDisconnect(callback: () => void): void;

    /**
     * Close the socket
     */
    close(): void;
}
