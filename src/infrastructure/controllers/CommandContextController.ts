import { User } from '../../domain/entities/User';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { DestroyClient } from '../../application/use-cases/clients/DestroyClient';
import { SetUserPassword } from '../../application/use-cases/user-secrets/SetUserPassword';
import { ICommunicationLayer } from '../../application/ports/services/ICommunicationLayer';
import { SendMailMessage } from '../../application/use-cases/mail/SendMailMessage';
import {
    CheckMailInbox,
    CheckMailInboxEntry,
} from '../../application/use-cases/mail/CheckMailInbox';
import { FindUser } from '../../application/use-cases/users/FindUser';
import { Cradle } from '../../boot/container';
import { JsonObject } from '../../domain/types/JsonStruct';
import { getMoonPhase } from '../../libs/moon-phase';
import { CLIENT_STATES } from '../../domain/enums/client-states';

export class CommandContextController {
    private sendClientMessage: SendClientMessage;
    private destroyClient: DestroyClient;
    private setUserPassword: SetUserPassword;
    private communicationLayer: ICommunicationLayer;
    private sendMailMessage: SendMailMessage;
    private checkMailInbox: CheckMailInbox;
    private findUser: FindUser;

    constructor(cradle: Cradle) {
        // use cases
        this.sendClientMessage = cradle.sendClientMessage;
        this.destroyClient = cradle.destroyClient;
        this.setUserPassword = cradle.setUserPassword;
        this.sendMailMessage = cradle.sendMailMessage;
        this.checkMailInbox = cradle.checkMailInbox;
        this.findUser = cradle.findUser;

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

    buildCommandContext(idClient: string) {
        const clientSession = this.getClientSession(idClient);
        if (!clientSession) {
            throw new Error(`client ${idClient} is not associated with a clientSession`);
        }
        const me = (): User => {
            if (clientSession.user) {
                return clientSession.user;
            } else {
                throw new Error(`client ${idClient} is not associated with a user`);
            }
        };
        const print = (key: string, parameters?: JsonObject): Promise<void> => {
            return this.sendClientMessage.execute(idClient, key, parameters);
        };
        const cmdContext = {
            /****** GETTING USERS ****** GETTING USERS ****** GETTING USERS ****** GETTING USERS ******/
            /****** GETTING USERS ****** GETTING USERS ****** GETTING USERS ****** GETTING USERS ******/
            /****** GETTING USERS ****** GETTING USERS ****** GETTING USERS ****** GETTING USERS ******/

            me,

            findUser: (displayName: string): Promise<User | undefined> => {
                return this.findUserByName(displayName);
            },

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
                const user = me();
                // Check if client is in AUTHENTICATED state
                if (clientSession.state !== CLIENT_STATES.AUTHENTICATED) {
                    await this.sendClientMessage.execute(idClient, 'passwdCmd.mustBeLobby');
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
                recipients: string[],
                topic: string,
                message: string
            ): Promise<void> => {
                const recipientUsers: User[] = [];
                const recipientIds: string[] = [];
                const notFoundRecipients: string[] = [];
                for (let i = 0, l = recipients.length; i < l; i++) {
                    const user = await this.findUser.execute({ displayName: recipients[i] });
                    if (user) {
                        recipientUsers.push(user);
                        recipientIds.push(user.id);
                    } else {
                        notFoundRecipients.push(recipients[i]);
                    }
                }
                const user = me();
                return this.sendMailMessage.execute(user.id, recipientIds, topic, message);
            },

            mailCheckInbox: async (): Promise<CheckMailInboxEntry[]> => {
                const user = me();
                return this.checkMailInbox.execute(user.id);
            },
        };
        return cmdContext;
    }
}
