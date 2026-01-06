import { User } from '../../../domain/entities/User';
import { ChannelDefinition } from '../../../domain/types/ChannelDefinition';

export type ChannelListItem = {
    id: string;
    tag: string;
    read: boolean;
    write: boolean;
    moderate: boolean;
    color: string;
};

export interface IChatManager {
    defineChannel(cd: ChannelDefinition): void;
    postMessage(idSender: string, idChannel: string, message: string): void;
    joinChannel(idUser: string, idChannel: string): void;
    registerUser(user: User): void;
    unregisterUser(user: User): void;
    toggleChannel(idUser: string, idChannel: string, bValue: boolean): void;
    getUserList(idChannel: string): string[];
    getUserJoinedChannels(idUser: string): ChannelListItem[];
    grantUserWrite(idUser: string, idChannel: string): void;
    revokeUserWrite(idUser: string, idChannel: string): void;
    checkUserWrite(idUser: string, idChannel: string): boolean;
}
