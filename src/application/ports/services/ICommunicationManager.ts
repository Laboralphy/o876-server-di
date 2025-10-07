export interface ICommunicationManager {
    sendMessage(clientId: string, message: string): void;
    closeClientConnection(clientId: string): void;
}
