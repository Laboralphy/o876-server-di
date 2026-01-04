import { AbstractContextService } from './AbstractContextService';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { User } from '../../../domain/entities/User';
import { FindUser } from '../../../application/use-cases/users/FindUser';
import { CLIENT_STATES } from '../../../domain/enums/client-states';
import { SetUserPassword } from '../../../application/use-cases/user-secrets/SetUserPassword';
import { ClientCradle } from '../../../boot/container';
import { ROLES } from '../../../domain/enums/roles';
import { BanUser } from '../../../application/use-cases/users/BanUser';
import { BanUserDto } from '../../../application/dto/BanUserDto';
import { ModifyUser } from '../../../application/use-cases/users/ModifyUser';
import { UnbanUser } from '../../../application/use-cases/users/UnbanUser';
import { SPECIAL_MESSAGE } from '../../../domain/enums/special-message';

export class UserContextService extends AbstractContextService {
    private readonly getUserList: GetUserList;
    private readonly setUserPassword: SetUserPassword;
    private readonly findUser: FindUser;
    private readonly banUser: BanUser;
    private readonly unbanUser: UnbanUser;
    private readonly modifyUser: ModifyUser;

    constructor(cradle: ClientCradle) {
        super(cradle);
        this.getUserList = cradle.getUserList;
        this.setUserPassword = cradle.setUserPassword;
        this.findUser = cradle.findUser;
        this.banUser = cradle.banUser;
        this.modifyUser = cradle.modifyUser;
        this.unbanUser = cradle.unbanUser;
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
        return !!this.communicationLayer.getUserClient(user);
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
            // Sends message
            // Sends echo off
            await this.sendClientMessage.execute(
                this.idClient,
                'changePassword.enterPreviousPassword',
                {
                    [SPECIAL_MESSAGE.NOLF]: true,
                }
            );
            await clientSession.clientSocket.send(Buffer.from([0xff, 0xfb, 0x01]));
        } else if (newPassword !== undefined && currentPassword !== undefined) {
            await this.setUserPassword.execute(user.id, newPassword, currentPassword);
        } else {
            throw new Error('Both new password and current password must be specified');
        }
    }

    /**
     * Returns true if user has Moderator role
     */
    isModerator() {
        return this.user.roles.includes(ROLES.MODERATOR);
    }

    /**
     * Returns true if user has Administrator role
     */
    isAdmin() {
        return this.user.roles.includes(ROLES.ADMIN);
    }

    /**
     * Returns true if user has game master role
     */
    isGameMaster() {
        return this.user.roles.includes(ROLES.GAME_MASTER);
    }

    /**
     * Ban a user
     * @param userToBan user
     * @param reason reason why user is banned
     * @param duration how long (in ms) user is banned
     */
    ban(userToBan: User, reason: string, duration: number) {
        const dto: BanUserDto = {
            reason,
            bannedBy: this.user.id,
            duration,
        };
        return this.banUser.execute(userToBan.id, dto);
    }

    /**
     * Unban a user
     * @param userToUnban
     */
    unban(userToUnban: User) {
        return this.unbanUser.execute(userToUnban.id);
    }

    /**
     * Change user gender : switch user gender from "non-female" to "female" and vice versa.
     * Gender are managed for string internationalization purpose.
     * User are only in one of these two categories : either "female" or "non-female"
     * @param user {User}
     * @param female {boolean}
     */
    setUserFemale(user: User, female: boolean) {
        return this.modifyUser.execute(user.id, { female });
    }
}
