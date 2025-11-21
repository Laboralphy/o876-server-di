import { IApiContextBuilder } from '../../application/ports/services/IApiContextBuilder';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { JsonObject } from '../../domain/types/JsonStruct';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { Cradle } from '../../boot/container';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { getMoonPhase } from '../../libs/moon-phase';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { SetUserPassword } from '../../application/use-cases/user-secrets/SetUserPassword';
import {
    CheckMailInbox,
    CheckMailInboxEntry,
} from '../../application/use-cases/mail/CheckMailInbox';
import { SendMailMessage } from '../../application/use-cases/mail/SendMailMessage';
import { User } from '../../domain/entities/User';
import { FindUser } from '../../application/use-cases/users/FindUser';
import { GetUserList } from '../../application/use-cases/users/GetUserList';

export class ApiContextBuilder implements IApiContextBuilder {
    private sendClientMessage: SendClientMessage;
    private destroyClient: DestroyClient;
    private setUserPassword: SetUserPassword;
    private communicationLayer: ICommunicationLayer;
    // mail
    private sendMailMessage: SendMailMessage;
    private checkMailInbox: CheckMailInbox;
    // users
    private findUser: FindUser;
    private getUserList: GetUserList;

    constructor(cradle: Cradle) {
        // use cases
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;
        this.setUserPassword = cradle.setUserPassword;
        // mail
        this.sendMailMessage = cradle.sendMailMessage;
        this.checkMailInbox = cradle.checkMailInbox;
        // users
        this.findUser = cradle.findUser;
        this.getUserList = cradle.getUserList;

        // services
        this.communicationLayer = cradle.communicationLayer;
    }

    getClientSession(idClient: string) {
        const clientSession = this.communicationLayer.getClientSession(idClient);
        if (!clientSession) {
            throw new Error(`client ${idClient} has no clientSession`);
        }
        return clientSession;
    }

    findUserByName(displayName: string): Promise<User | undefined> {
        return this.findUser.execute({ displayName });
    }

    buildApiContext(idClient: string): IClientContext {
        const me = (): User => {
            const clientSession = this.getClientSession(idClient);
            if (clientSession.user) {
                return clientSession.user;
            } else {
                throw new Error(`client ${idClient} is not associated with a user`);
            }
        };
        const print = (key: string, parameters?: JsonObject): Promise<void> => {
            return this.sendClientMessage.execute(idClient, key, parameters);
        };
        const cmdContext: IClientContext = {
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/

            print,

            closeConnection: () => {
                return this.destroyClient.execute(idClient);
            },

            getServerTime: () => {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const date = new Date();
                const moon = getMoonPhase(date);
                return {
                    date,
                    timezone,
                    moon,
                };
            },

            changePassword: async (
                newPassword?: string,
                currentPassword?: string
            ): Promise<void> => {
                const clientSession = this.getClientSession(idClient);
                const user = me();
                // Check if client is in AUTHENTICATED state
                if (clientSession.state !== CLIENT_STATES.AUTHENTICATED) {
                    await this.sendClientMessage.execute(idClient, 'passwd.mustBeLobby');
                    return;
                }
                if (newPassword === undefined && currentPassword === undefined) {
                    // Send a message
                    // Put client in state CHANGE_PASSWORD
                    clientSession.state = CLIENT_STATES.CHANGE_PASSWORD;
                    clientSession.processRegistry.set('phase', 0);
                    clientSession.processRegistry.set('changePasswordStruct', {
                        currentPassword: '',
                        newPassword: '',
                    });
                    // Sends message
                    // Sends echo off
                    await print('changePassword.enterPreviousPassword', {
                        _nolf: true,
                    });
                    await clientSession.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01]));
                } else if (newPassword !== undefined && currentPassword !== undefined) {
                    await this.setUserPassword.execute(user.id, newPassword, currentPassword);
                } else {
                    throw new Error('Both new password and current password must be specified');
                }
            },

            /****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ******/
            /****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ******/
            /****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ****** MAIL MESSAGING ******/

            mailSendMessage: async (
                recipients: User[],
                topic: string,
                message: string
            ): Promise<void> => {
                const user = me();
                return this.sendMailMessage.execute(
                    user.id,
                    recipients.map((r) => r.id),
                    topic,
                    message
                );
            },

            mailCheckInbox: async (): Promise<CheckMailInboxEntry[]> => {
                const user = me();
                return this.checkMailInbox.execute(user.id);
            },

            /****** USER MANAGEMENT ****** USER MANAGEMENT ****** USER MANAGEMENT ******/
            /****** USER MANAGEMENT ****** USER MANAGEMENT ****** USER MANAGEMENT ******/
            /****** USER MANAGEMENT ****** USER MANAGEMENT ****** USER MANAGEMENT ******/

            getUserList: async (): Promise<User[]> => {
                return this.getUserList.execute();
            },

            me,

            isUserConnected: (user: User): boolean => {
                return this.communicationLayer.getUserClients(user).length > 0;
            },

            findUser: (displayName: string): Promise<User | undefined> => {
                return this.findUserByName(displayName);
            },
        };
        return cmdContext;
    }
}
