import { ClientSession } from '../../domain/types/ClientSession';
import { SuccessFailureOutcome } from '../../domain/types/SuccessFailureOutcome';
import { AbstractMessageProcessor } from './AbstractMessageProcessor';
import { CreateUserDto } from '../../application/dto/CreateUserDto';

enum CREATE_ACCOUNT_PHASES {
    ENTER_LOGIN,
    ENTER_PASSWORD,
    CONFIRM_PASSWORD,
    ENTER_EMAIL,
    ENTER_DISPLAY_NAME,
    ACCOUNT_CREATED,
    PASSWORD_MISMATCH,
}

type CreateAccountProcessorResult = SuccessFailureOutcome & CreateUserDto;

export class CreateAccountProcessor extends AbstractMessageProcessor<CreateAccountProcessorResult> {
    private _phase: CREATE_ACCOUNT_PHASES = CREATE_ACCOUNT_PHASES.ENTER_LOGIN;
    private _name: string = '';
    private _password: string = '';
    private _email: string = '';
    private _displayName: string = '';

    constructor(clientSession: ClientSession) {
        super(clientSession);
    }

    get status() {
        return {
            success: this._phase == CREATE_ACCOUNT_PHASES.ACCOUNT_CREATED,
            failure: this._phase == CREATE_ACCOUNT_PHASES.PASSWORD_MISMATCH,
            name: this._name,
            password: this._password,
            email: this._email,
            displayName: this._displayName,
        };
    }

    async processMessage(message: string): Promise<CreateAccountProcessorResult> {
        switch (this._phase) {
            case CREATE_ACCOUNT_PHASES.ENTER_LOGIN: {
                // client is expected to enter login
                this._name = message;
                this._phase = CREATE_ACCOUNT_PHASES.ENTER_PASSWORD;
                await this.sendMessage('createNewAccount.password', { _nolf: true });
                await this.echo(false);
                break;
            }

            case CREATE_ACCOUNT_PHASES.ENTER_PASSWORD: {
                // Client is expected to enter password
                await this.echo(true);
                await this.send('\n');
                if (message == '') {
                    await this.sendMessage('createNewAccount.emptyPassword');
                    await this.sendMessage('createNewAccount.password', { _nolf: true });
                    await this.echo(false);
                } else {
                    this._password = message;
                    this._phase = CREATE_ACCOUNT_PHASES.CONFIRM_PASSWORD;
                    await this.sendMessage('createNewAccount.confirmPassword', { _nolf: true });
                    await this.echo(false);
                }
                break;
            }

            case CREATE_ACCOUNT_PHASES.CONFIRM_PASSWORD: {
                // Client is expected to confirm password
                await this.echo(true);
                await this.send('\n');
                if (this._password != message) {
                    // client sent the same password
                    this._phase = CREATE_ACCOUNT_PHASES.ENTER_EMAIL;
                    await this.sendMessage('createNewAccount.email', { _nolf: true });
                } else {
                    // client did not send the same password
                    // cancel the whole operation
                    this._phase = CREATE_ACCOUNT_PHASES.PASSWORD_MISMATCH;
                    await this.sendMessage('createNewAccount.passwordMismatch');
                }
                break;
            }

            case CREATE_ACCOUNT_PHASES.ENTER_EMAIL: {
                this._email = message;
                await this.sendMessage('createNewAccount.displayNameInfo');
                await this.sendMessage('createNewAccount.displayName', { _nolf: true });
                this._phase = CREATE_ACCOUNT_PHASES.ENTER_DISPLAY_NAME;
                break;
            }

            case CREATE_ACCOUNT_PHASES.ENTER_DISPLAY_NAME: {
                this._displayName = message;
                this._phase = CREATE_ACCOUNT_PHASES.ACCOUNT_CREATED;
                break;
            }

            default: {
                throw new Error('This login processor phase is not supported');
            }
        }
        return this.status;
    }
}
