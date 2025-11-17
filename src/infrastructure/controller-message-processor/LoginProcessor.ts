import { ClientSession } from '../../domain/types/ClientSession';
import { SuccessFailureOutcome } from '../../domain/types/SuccessFailureOutcome';
import { AbstractMessageProcessor } from './AbstractMessageProcessor';

enum LOGIN_PHASES {
    ENTER_LOGIN,
    ENTER_PASSWORD,
    LOGIN_PASSWORD_READY,
    CREATE_ACCOUNT,
}

type LoginProcessorResult = SuccessFailureOutcome & {
    login: string;
    password: string;
    createAccount: boolean;
};

export class LoginProcessor extends AbstractMessageProcessor<LoginProcessorResult> {
    private _phase: LOGIN_PHASES = LOGIN_PHASES.ENTER_LOGIN;
    private _login: string = '';
    private _password: string = '';

    constructor(
        clientSession: ClientSession,
        private readonly specialCreateAccount: string
    ) {
        super(clientSession);
    }

    get status() {
        return {
            success:
                this._phase == LOGIN_PHASES.LOGIN_PASSWORD_READY ||
                this._phase == LOGIN_PHASES.CREATE_ACCOUNT,
            failure: false,
            login: this._login,
            password: this._password,
            createAccount: this._phase == LOGIN_PHASES.CREATE_ACCOUNT,
        };
    }

    async processMessage(message: string): Promise<LoginProcessorResult> {
        switch (this._phase) {
            case LOGIN_PHASES.ENTER_LOGIN: {
                // client is expected to enter login
                // entering special value "new" results in a special outcome
                if (message == this.specialCreateAccount) {
                    this._phase = LOGIN_PHASES.CREATE_ACCOUNT;
                } else {
                    this._login = message;
                    this._phase = LOGIN_PHASES.ENTER_PASSWORD;
                    await this.sendMessage('welcome.password', { _nolf: true });
                    await this.echo(false);
                }
                break;
            }

            case LOGIN_PHASES.ENTER_PASSWORD: {
                // Client is expected to enter password
                await this.echo(true);
                await this.send('\n');
                this._password = message;
                this._phase = LOGIN_PHASES.LOGIN_PASSWORD_READY;
                break;
            }

            default: {
                throw new Error('This login processor phase is not supported');
            }
        }
        return this.status;
    }
}
