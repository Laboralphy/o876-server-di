import { ChannelDefinition } from '../../../infrastructure/services/ChatManager';
import { User } from '../../../domain/entities/User';

export interface IChatManager {
    defineChannel(cd: ChannelDefinition): void;
    postMessage(idSender: string, idChannel: string, message: string): void;
    joinChannel(idUser: string, idChannel: string): void;
    registerUser(user: User): void;
    unregisterUser(user: User): void;
    getUserList(idChannel: string): string[];
}
