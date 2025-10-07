export interface ICommunicationManager {
    /**
     * Sends a message to a specific client
     * @param clientId
     * @param message
     */
    sendMessage(clientId: string, message: string): void;
    closeClientConnection(clientId: string): void;
}
