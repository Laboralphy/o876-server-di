import { ClientSession } from '../../domain/types/ClientSession';
import { SuccessFailureOutcome } from '../../domain/types/SuccessFailureOutcome';
import { AbstractMessageProcessor } from './AbstractMessageProcessor';

enum PASSWORD_CHANGE_PHASES {
    ENTER_CURRENT_PASSWORD,
    ENTER_NEW_PASSWORD,
    CONFIRM_NEW_PASSWORD,
    PASSWORD_CHANGED,
    PASSWORD_MISMATCH,
    PASSWORD_EMPTY,
}

type PasswordChangerProcessorResult = SuccessFailureOutcome & {
    currentPassword: string;
    newPassword: string;
};

export class PasswordChangeProcessor extends AbstractMessageProcessor<PasswordChangerProcessorResult> {
    private _phase: PASSWORD_CHANGE_PHASES = PASSWORD_CHANGE_PHASES.ENTER_CURRENT_PASSWORD;
    private _password: string = '';
    private _currentPassword: string = '';

    constructor(clientSession: ClientSession) {
        super(clientSession);
    }

    get status(): PasswordChangerProcessorResult {
        const success = this._phase == PASSWORD_CHANGE_PHASES.PASSWORD_CHANGED;
        const failure =
            this._phase == PASSWORD_CHANGE_PHASES.PASSWORD_EMPTY ||
            this._phase == PASSWORD_CHANGE_PHASES.PASSWORD_MISMATCH;
        return {
            success,
            failure,
            currentPassword: this._currentPassword,
            newPassword: this._password,
        };
    }

    async processMessage(message: string): Promise<PasswordChangerProcessorResult> {
        switch (this._phase) {
            case PASSWORD_CHANGE_PHASES.ENTER_CURRENT_PASSWORD: {
                await this.currentPasswordPhase(message);
                break;
            }

            case PASSWORD_CHANGE_PHASES.ENTER_NEW_PASSWORD: {
                await this.newPasswordPhase(message);
                break;
            }

            case PASSWORD_CHANGE_PHASES.CONFIRM_NEW_PASSWORD: {
                await this.confirmNewPasswordPhase(message);
                break;
            }

            default: {
                throw new Error('This password change processor phase is not supported');
            }
        }
        return this.status;
    }

    /**
     * Client is expected to enter current password
     * Just to check if nobody is trying to change his/her password while he/she is AFK
     * @param message
     */
    async currentPasswordPhase(message: string) {
        this._currentPassword = message;
        this._phase = PASSWORD_CHANGE_PHASES.ENTER_NEW_PASSWORD;
        await this.echo(true);
        await this.send('\n');
        await this.sendMessage('changePassword.enterNewPassword', {
            _nolf: true,
        });
        await this.echo(false);
    }

    /**
     * Client is expected to enter new password
     * This password should not be empty or the process is cancelled
     * @param message
     */
    async newPasswordPhase(message: string) {
        if (message == '') {
            await this.echo(true);
            await this.send('\n');
            await this.sendMessage('changePassword.emptyPassword');
            this._phase = PASSWORD_CHANGE_PHASES.PASSWORD_EMPTY;
        } else {
            this._password = message;
            await this.echo(true);
            await this.send('\n');
            await this.sendMessage('changePassword.confirmNewPassword', { _nolf: true });
            await this.echo(false);
            this._phase = PASSWORD_CHANGE_PHASES.CONFIRM_NEW_PASSWORD;
        }
    }

    /**
     * Client is expected to enter the same password for confirmation
     * if password are different, there will be a mismatch and operation will be cancelled
     * @param message
     */
    async confirmNewPasswordPhase(message: string) {
        await this.echo(false);
        await this.send('\n');
        if (message == this._password) {
            // passwords match
            this._phase = PASSWORD_CHANGE_PHASES.PASSWORD_CHANGED;
        } else {
            // passwords dont match
            await this.sendMessage('changePassword.passwordMismatch');
            this._phase = PASSWORD_CHANGE_PHASES.PASSWORD_MISMATCH;
        }
    }
}
