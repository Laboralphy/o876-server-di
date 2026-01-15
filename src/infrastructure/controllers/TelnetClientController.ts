import { Client as TelnetClient } from '../../../@types/telnet2';
import { TelnetClientSocket } from '../services/TelnetClientSocket';
import { AbstractClientController } from './AbstractClientController';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { CreateUserDto } from '../../application/dto/CreateUserDto';
import { ClientSession } from '../../domain/types/ClientSession';
import { JsonObject } from '../../domain/types/JsonStruct';
import { debug } from '../../libs/o876-debug';
import { UserName } from '../../domain/schemas/UserName';
import { DisplayName } from '../../domain/schemas/DisplayName';
import { EmailString } from '../../domain/schemas/EmailString';
import { ClientCradle } from '../../boot/container';
import { IClientContext } from '../../application/ports/classes/IClientContext';
import { IApiContextBuilder } from '../../application/ports/services/IApiContextBuilder';
import { SPECIAL_MESSAGE } from '../../domain/enums/special-message';
import { GMCPGateway } from '../services/GMCPGateway';
import { IGMCPGateway } from '../../application/ports/services/IGMCPGateway';
import { GMCPPacket } from '../../libs/gmcp/GMCPPacket';

const debugTelnet = debug('srv:telnet');

enum PHASES {
    NONE,
    EXPECT_LOGIN,
    EXPECT_PASSWORD,
    EXPECT_USERNAME,
    EXPECT_EMAIL_ADDRESS,
    EXPECT_DISPLAY_NAME,
    EXPECT_CURRENT_PASSWORD,
    EXPECT_NEW_PASSWORD,
    EXPECT_CONFIRM_PASSWORD,
    EXPECT_TEXT_LINE,
}

type ChangePasswordStruct = {
    currentPassword: string;
    newPassword: string;
};

type TextEditorStruct = {
    lines: string[];
    prevState: CLIENT_STATES;
};

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class TelnetClientController extends AbstractClientController {
    private readonly apiContextBuilder: IApiContextBuilder;
    private readonly idClient: string;
    private phase: PHASES;
    private changePasswordStruct: ChangePasswordStruct;
    private createAccountStruct: CreateUserDto;
    private textEditorStruct: TextEditorStruct;
    private gmcpGateway: IGMCPGateway;

    constructor(cradle: ClientCradle) {
        super(cradle);
        this.gmcpGateway = cradle.gmcpGateway;
        this.idClient = cradle.idClient;
        this.phase = PHASES.NONE;
        this.changePasswordStruct = {
            currentPassword: '',
            newPassword: '',
        };
        this.createAccountStruct = {
            name: '',
            password: '',
            displayName: '',
            email: '',
        };
        this.textEditorStruct = {
            lines: [],
            prevState: CLIENT_STATES.NONE,
        };
        this.apiContextBuilder = cradle.apiContextBuilder;
    }

    async echo(idClient: string, b: boolean): Promise<void> {
        const csd = this.getClientSession(idClient);
        const clientSocket = csd.clientSocket;
        return b
            ? clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])) // reactivate echo
            : clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // deactivate echo
    }

    async exitPasswordMode(idClient: string) {
        await this.echo(idClient, true);
        await this.send(idClient, '\n');
    }

    async askString(idClient: string, key: string, parameters?: JsonObject) {
        const p = parameters
            ? { ...parameters, [SPECIAL_MESSAGE.NOLF]: true }
            : { [SPECIAL_MESSAGE.NOLF]: true };
        await this.sendMessage(idClient, key, p);
    }

    async askPassword(idClient: string, key: string, parameters?: JsonObject) {
        const p = parameters
            ? { ...parameters, [SPECIAL_MESSAGE.NOLF]: true }
            : { [SPECIAL_MESSAGE.NOLF]: true };
        await this.sendMessage(idClient, key, p);
        await this.echo(idClient, false);
    }

    async loginProcess(clientSession: ClientSession, message: string = ''): Promise<void> {
        if (this.phase == PHASES.NONE) {
            debugTelnet('client %s is entering login process', clientSession.id);
            // entering login process for the first time
            // displaying prompt, setting phase, and exit
            this.phase = PHASES.EXPECT_LOGIN;
            return this.askString(clientSession.id, 'welcome.login');
        }
        switch (this.phase) {
            case PHASES.EXPECT_LOGIN: {
                // client is expected to enter login or "new"
                if (
                    message.toLowerCase() ==
                    this.getServerConfig().getVariables().loginNewUser.toLowerCase()
                ) {
                    debugTelnet('client %s : is asking for account creation', clientSession.id);
                    this.phase = PHASES.NONE;
                    // client has entered the "new" word
                    // Will now branch to account creation process
                    clientSession.state = CLIENT_STATES.CREATE_ACCOUNT;
                    // And send a message
                    await this.createAccountProcess(clientSession);
                } else {
                    // regular username
                    clientSession.login = message;
                    // prompt the "enter password" message
                    await this.askPassword(clientSession.id, 'welcome.password');
                    this.phase = PHASES.EXPECT_PASSWORD;
                }
                break;
            }

            case PHASES.EXPECT_PASSWORD: {
                // exit password mode
                await this.exitPasswordMode(clientSession.id);
                // client is expected to enter password
                const { authenticated: bLogInResult, reason } = await this.setLoginPassword(
                    clientSession.id,
                    message
                );
                if (bLogInResult) {
                    // authentication ok
                    // Change client state
                    clientSession.state = CLIENT_STATES.AUTHENTICATED;
                } else {
                    if (clientSession.state === CLIENT_STATES.BANNED) {
                        debugTelnet('client %s : user banned', clientSession.id);
                        await this.pauseClient(clientSession.id, 100);
                    } else {
                        debugTelnet('client %s : authentication failed', clientSession.id);
                        await this.pauseClient(clientSession.id, 100);
                        await this.sendMessage(clientSession.id, 'welcome.badLogin', { reason });
                    }
                    await this.dropClient(clientSession.id);
                    this.phase = PHASES.NONE;
                    break;
                }
                this.phase = PHASES.NONE;
                break;
            }

            default: {
                break;
            }
        }
    }

    async createAccountProcess(clientSession: ClientSession, message: string = '') {
        if (this.phase == PHASES.NONE) {
            // entering account creation process for the first time
            // displaying prompt, setting phase, and exit
            this.phase = PHASES.EXPECT_USERNAME;
            this.createAccountStruct = {
                name: '',
                displayName: '',
                email: '',
                password: '',
            };
            return this.askString(clientSession.id, 'createNewAccount.username');
        }

        switch (this.phase) {
            case PHASES.EXPECT_USERNAME: {
                // client is expected to enter username
                // check username at once for availability
                // if username already taken, send message, exit
                // if username valid : next phase
                if (!UserName.safeParse(message).success) {
                    // the username is invalid
                    await this.sendMessage(clientSession.id, 'createNewAccount.usernameInvalid');
                    // another chance
                    await this.sendMessage(clientSession.id, 'createNewAccount.usernameHint');
                    return this.askString(clientSession.id, 'createNewAccount.username');
                } else if (await this.findUserByName(message)) {
                    // username already taken
                    await this.sendMessage(clientSession.id, 'createNewAccount.nameTaken');
                    // another chance
                    return this.askString(clientSession.id, 'createNewAccount.username');
                } else {
                    // username seems ok
                    this.createAccountStruct.name = message;
                    this.phase = PHASES.EXPECT_PASSWORD;
                    await this.askPassword(clientSession.id, 'createNewAccount.password');
                }
                break;
            }

            case PHASES.EXPECT_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message === '') {
                    // empty password is forbiden
                    await this.sendMessage(clientSession.id, 'createNewAccount.emptyPassword');
                    await this.askPassword(clientSession.id, 'createNewAccount.password');
                } else {
                    // ok password
                    await this.askPassword(clientSession.id, 'createNewAccount.confirmPassword');
                    this.phase = PHASES.EXPECT_CONFIRM_PASSWORD;
                    this.createAccountStruct.password = message;
                }
                break;
            }

            case PHASES.EXPECT_CONFIRM_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message === this.createAccountStruct.password && message !== '') {
                    // passwords match
                    // go to the new phase
                    this.phase = PHASES.EXPECT_EMAIL_ADDRESS;
                    await this.askString(clientSession.id, 'createNewAccount.email');
                } else {
                    // passwords don't match
                    // Drop the client after message
                    await this.sendMessage(clientSession.id, 'createNewAccount.passwordMismatch');
                    await this.dropClient(clientSession.id);
                }
                break;
            }

            case PHASES.EXPECT_EMAIL_ADDRESS: {
                if (EmailString.safeParse(message).success) {
                    this.createAccountStruct.email = message;
                    // goto next phase
                    this.phase = PHASES.EXPECT_DISPLAY_NAME;
                    // now asking for display name
                    await this.askString(clientSession.id, 'createNewAccount.displayName');
                } else {
                    await this.sendMessage(clientSession.id, 'createNewAccount.emailInvalid');
                    await this.askString(clientSession.id, 'createNewAccount.email');
                }
                break;
            }

            case PHASES.EXPECT_DISPLAY_NAME: {
                // Check if display name is valid
                // check if display anme is already taken
                // go to next phase
                if (DisplayName.safeParse(message).success) {
                    // seems ok
                    // let's see if not already taken
                    if (await this.findUserByDisplayName(message)) {
                        // Sorry, display name already taken by someone
                        // Take another chance
                        await this.sendMessage(
                            clientSession.id,
                            'createNewAccount.displayNameTaken'
                        );
                        await this.sendMessage(clientSession.id, 'createNewAccount.displayName');
                    } else {
                        // Display name ok and available
                        // Try create user account
                        this.createAccountStruct.displayName = message;
                        try {
                            const user = await this.createNewAccount(
                                clientSession.id,
                                this.createAccountStruct
                            );
                            if (user) {
                                // user creation seems ok
                                // We should ask for login now, with this new account
                                await this.sendMessage(
                                    clientSession.id,
                                    'createNewAccount.success',
                                    {
                                        name: this.createAccountStruct.name,
                                    }
                                );
                                clientSession.state = CLIENT_STATES.LOGIN;
                                this.phase = PHASES.NONE;
                                await this.loginProcess(clientSession);
                            } else {
                                // something went wrong during character creation
                                await this.sendMessage(
                                    clientSession.id,
                                    'createNewAccount.failure'
                                );
                                await this.dropClient(clientSession.id);
                            }
                        } catch (error) {
                            // something went UTTERLY wrong during character creation
                            await this.sendMessage(clientSession.id, (error as Error).message);
                            await this.sendMessage(clientSession.id, 'createNewAccount.failure');
                            await this.dropClient(clientSession.id);
                        }
                    }
                } else {
                    // invalid display name
                    // take another chance
                    await this.sendMessage(clientSession.id, 'createNewAccount.displayNameInvalid');
                    await this.sendMessage(clientSession.id, 'createNewAccount.displayNameHint');
                    await this.askString(clientSession.id, 'createNewAccount.displayName');
                }
                break;
            }

            default: {
                break;
            }
        }
    }

    async changePasswordProcess(clientSession: ClientSession, message: string = '') {
        // User wants to change its password
        if (this.phase == PHASES.NONE) {
            this.phase = PHASES.EXPECT_CURRENT_PASSWORD;
            this.changePasswordStruct = {
                currentPassword: '',
                newPassword: '',
            };
            await this.askPassword(clientSession.id, 'changePassword.enterPreviousPassword');
        }

        switch (this.phase) {
            case PHASES.EXPECT_CURRENT_PASSWORD: {
                this.changePasswordStruct.currentPassword = message;
                await this.exitPasswordMode(clientSession.id);
                await this.askPassword(clientSession.id, 'changePassword.enterNewPassword');
                this.phase = PHASES.EXPECT_NEW_PASSWORD;
                break;
            }
            case PHASES.EXPECT_NEW_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message == '') {
                    await this.sendMessage(clientSession.id, 'createNewAccount.emptyPassword');
                    await this.askPassword(clientSession.id, 'changePassword.enterNewPassword');
                } else {
                    this.changePasswordStruct.newPassword = message;
                    await this.askPassword(clientSession.id, 'changePassword.confirmNewPassword');
                    this.phase = PHASES.EXPECT_CONFIRM_PASSWORD;
                }
                break;
            }
            case PHASES.EXPECT_CONFIRM_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message == this.changePasswordStruct.newPassword) {
                    // Client has confirmed new password
                    // Try to change password with use case
                    const bSuccess = await this.changePassword(
                        clientSession.id,
                        this.changePasswordStruct.newPassword,
                        this.changePasswordStruct.currentPassword
                    );
                    await this.sendMessage(
                        clientSession.id,
                        bSuccess ? 'changePassword.success' : 'changePassword.failure'
                    );
                } else {
                    await this.sendMessage(clientSession.id, 'changePassword.passwordMismatch');
                }
                this.phase = PHASES.NONE;
                clientSession.state = CLIENT_STATES.AUTHENTICATED;
                break;
            }
            default: {
                break;
            }
        }
    }

    async textEditorProcess(clientSession: ClientSession, message: string = '') {
        // user is expected to enter lines of text
        // text editor process ends when a single period sign is entered
        if (this.phase == PHASES.NONE) {
            this.phase = PHASES.EXPECT_TEXT_LINE;
            this.textEditorStruct = {
                lines: [message.replace(/\|$/, '').trim()],
                prevState: clientSession.state,
            };
            clientSession.state = CLIENT_STATES.TEXT_EDITOR;
            await this.sendMessage(clientSession.id, 'textEditor.starting');
        } else if (message == '.') {
            // end of text editor mode
            clientSession.state = this.textEditorStruct.prevState;
            await this.execCommand(clientSession.id, this.textEditorStruct.lines.join('\n').trim());
        } else {
            this.textEditorStruct.lines.push(message);
        }
    }

    /**
     * One client is connecting to telnet server.
     * The function parameter is the telnet socket
     * We listen the events fired by this socket, and we execute the corresponding use cases.
     */
    async connect(socket: TelnetClient) {
        const clientSocket = new TelnetClientSocket(socket);
        // create new client session
        const idClient = this.idClient;
        const clientContext: IClientContext = this.apiContextBuilder.buildApiContext();
        const clientSession = this.initClientSession(idClient, clientSocket, clientContext);
        const serverConfig = this.getServerConfig();
        const newAccountCode = serverConfig.getVariables().loginNewUser;
        await clientContext.print('server-welcome', {
            serverDescription: serverConfig.getVariables().description,
            serverVersion: serverConfig.getVariables().version,
            newAccountCode,
        });
        await this.echo(idClient, true);
        // Initializing loginProcess
        this.phase = PHASES.NONE;
        await this.loginProcess(clientSession);

        clientSocket.onMessage(async (message: string | Buffer) => {
            if (message instanceof Buffer) {
                try {
                    // This is where GMCP enters
                    // TODO process gmcp Buffer here
                    const p = GMCPPacket.parse(message);
                    return this.execGMCPCommand(idClient, p);
                } catch (err) {
                    const error = err as Error;
                    console.error(error);
                    // any error leads to client disconnection
                    // we don't want anything suspicious here
                    await this.dropClient(idClient);
                }
            } else {
                message = message.toString();
                try {
                    // in telnet
                    // the first two messages are used to receive credentials
                    // the subsequent messages must be parsed
                    const csd = this.getClientSession(idClient);
                    switch (csd.state) {
                        case CLIENT_STATES.NONE: {
                            // Client has been disconnected or is about to be disconnected
                            // ignore message
                            break;
                        }

                        case CLIENT_STATES.PAUSE: {
                            // Client is not supposed to send message, the process is paused for security reason
                            // ignore message
                            break;
                        }

                        case CLIENT_STATES.LOGIN: {
                            await this.loginProcess(csd, message);
                            break;
                        }

                        case CLIENT_STATES.CREATE_ACCOUNT: {
                            await this.createAccountProcess(csd, message);
                            break;
                        }

                        case CLIENT_STATES.AUTHENTICATED: {
                            // When client is authenticated, all message are passed to th command interpreter
                            if (message.endsWith('|')) {
                                await this.textEditorProcess(
                                    clientSession,
                                    message.slice(0, message.length - 1)
                                );
                            } else {
                                await this.execCommand(idClient, message);
                            }
                            break;
                        }

                        case CLIENT_STATES.TEXT_EDITOR: {
                            await this.textEditorProcess(csd, message);
                            break;
                        }

                        case CLIENT_STATES.CHANGE_PASSWORD: {
                            await this.changePasswordProcess(csd, message);
                            break;
                        }

                        default: {
                            // Unexpected client state
                            // Destroying client
                            debugTelnet('client %s is in an unknown state %d', idClient, csd.state);
                            return this.dropClient(idClient);
                        }
                    }
                } catch (err) {
                    const error = err as Error;
                    console.error(error);
                    // any error leads to client disconnection
                    // we don't want anything suspicious here
                    await this.dropClient(idClient);
                }
            }
        });
    }
}
