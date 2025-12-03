import { AbstractContextService } from './AbstractContextService';
import { ScopedCradle } from '../ApiContextBuilder';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { User } from '../../../domain/entities/User';
import { FindUser } from '../../../application/use-cases/users/FindUser';
import { CLIENT_STATES } from '../../../domain/enums/client-states';
import { SetUserPassword } from '../../../application/use-cases/user-secrets/SetUserPassword';

export class UserContextService extends AbstractContextService {
    private readonly getUserList: GetUserList;
    private readonly setUserPassword: SetUserPassword;
    private readonly findUser: FindUser;

    constructor(cradle: ScopedCradle) {
        super(cradle);
        this.getUserList = cradle.getUserList;
        this.setUserPassword = cradle.setUserPassword;
        this.findUser = cradle.findUser;
    }

    getUsers(): Promise<User[]> {
        return this.getUserList.execute();
    }

    /**
     * Returns true if the specified user is currently connected
     * ( = has one or more clients )
     * @param user user instance
     */
    isConnected(user: User): boolean {
        return this.communicationLayer.getUserClients(user).length > 0;
    }

    /**
     * Returns instance of the user at the origin of this command.
     * @return {User}
     */
    get self(): User {
        return this.user;
    }

    /**
     * Return a User instance by providing display name
     * Returns undefined if not found
     * @param displayName user display name
     */
    find(displayName: string): Promise<User | undefined> {
        return this.findUser.execute({ displayName });
    }

    /**
     * Change user password. Either interactively or with parameters.
     * @param newPassword
     * @param currentPassword
     * if passwords are specified (both new and current), the method will attempt to change the
     * user password. The operation will fail if currentPassword does not match the user's current password.
     * if no password is specified, the client is supposed to enter a "changePasswordProcess"
     * That's mean that an interactive process will occur and the user will be invited to enter
     * its current password, then a new password, and then confirm this new password.
     */
    async changePassword(newPassword?: string, currentPassword?: string): Promise<void> {
        const clientSession = this.clientSession;
        const user = this.user;
        // Check if client is in AUTHENTICATED state
        if (clientSession.state !== CLIENT_STATES.AUTHENTICATED) {
            await this.sendClientMessage.execute(this.idClient, 'passwd.mustBeLobby');
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
                this.idClient,
                'changePassword.enterPreviousPassword',
                {
                    _nolf: true,
                }
            );
            await clientSession.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01]));
        } else if (newPassword !== undefined && currentPassword !== undefined) {
            await this.setUserPassword.execute(user.id, newPassword, currentPassword);
        } else {
            throw new Error('Both new password and current password must be specified');
        }
    }
}
