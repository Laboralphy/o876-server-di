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

export class ApiContextBuilder implements IApiContextBuilder {
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

    getClientUser(idClient: string): User {
        const clientSession = this.getClientSession(idClient);
        if (clientSession.user) {
            return clientSession.user;
        } else {
            throw new Error(`client ${idClient} is not associated with a user`);
        }
    }

    buildApiContext(idClient: string): IClientContext {
        const apiContext: IClientContext = {
            getClientId: () => idClient,

            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/
            /****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ****** CORE ******/

            sendMessage: (key: string, parameters?: JsonObject): Promise<void> => {
                return this.sendClientMessage.execute(idClient, key, parameters);
            },

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
                const clientSession = this.communicationLayer.getClientSession(idClient);
                if (!clientSession) {
                    throw new Error(
                        `At this stage, client session should have been initialized for client ${idClient}`
                    );
                }
                if (!clientSession.user) {
                    throw new Error(
                        `At this stage, client session user instance should have been initialized for client ${idClient}`
                    );
                }
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
                    await this.sendClientMessage.execute(
                        clientSession.id,
                        'changePassword.enterPreviousPassword',
                        { _nolf: true }
                    );
                    await clientSession.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01]));
                } else if (newPassword !== undefined && currentPassword !== undefined) {
                    await this.setUserPassword.execute(
                        clientSession.user.id,
                        newPassword,
                        currentPassword
                    );
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
                const user = this.getClientUser(idClient);
                return this.sendMailMessage.execute(user.id, recipientIds, topic, message);
            },

            mailCheckInbox: async (): Promise<CheckMailInboxEntry[]> => {
                const user = this.getClientUser(idClient);
                return this.checkMailInbox.execute(user.id);
            },
        };
        return apiContext;
    }
}
