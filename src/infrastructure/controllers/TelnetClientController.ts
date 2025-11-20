import { Client as TelnetClient } from '../../../@types/telnet2';
import { TelnetClientSocket } from '../services/TelnetClientSocket';
import { AbstractClientController } from './AbstractClientController';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { CreateUserDto } from '../../application/dto/CreateUserDto';
import { ClientSession } from '../../domain/types/ClientSession';
import { JsonObject } from '../../domain/types/JsonStruct';
import { REGEX_DISPLAYNAME, REGEX_USERNAME } from '../../domain/entities/User';
import { debug } from '../../libs/o876-debug';

const debugTelnet = debug('srv:telnet');

function echo(csd: ClientSession, b: boolean): Promise<void> {
    const clientSocket = csd.clientSocket;
    return b
        ? clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])) // reactivate echo
        : clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // deactivate echo
}

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class TelnetClientController extends AbstractClientController {
    #echoValue: boolean = true;

    async echo(idClient: string, b: boolean): Promise<void> {
        this.#echoValue = b;
        return echo(this.getClientSession(idClient), b);
    }

    async exitPasswordMode(idClient: string) {
        await this.echo(idClient, true);
        await this.send(idClient, '\n');
    }

    async askString(idClient: string, key: string, parameters?: JsonObject) {
        const p = parameters ? { ...parameters, _nolf: true } : { _nolf: true };
        await this.sendMessage(idClient, key, p);
    }

    async askPassword(idClient: string, key: string, parameters?: JsonObject) {
        const p = parameters ? { ...parameters, _nolf: true } : { _nolf: true };
        await this.sendMessage(idClient, key, p);
        await this.echo(idClient, false);
    }

    async loginProcess(clientSession: ClientSession, message: string = ''): Promise<void> {
        enum PHASES {
            EXPECT_LOGIN,
            EXPECT_PASSWORD,
        }
        if (!clientSession.processRegistry.has('phase')) {
            debugTelnet('client %s is entering login process', clientSession.id);
            // entering login process for the first time
            // displaying prompt, setting phase, and exit
            clientSession.processRegistry.set('phase', PHASES.EXPECT_LOGIN);
            return this.askString(clientSession.id, 'welcome.login');
        }
        switch (clientSession.processRegistry.get('phase') as PHASES) {
            case PHASES.EXPECT_LOGIN: {
                // client is expected to enter login or "new"
                if (
                    message.toLowerCase() ==
                    this.getServerConfig().getVariables().loginNewUser.toLowerCase()
                ) {
                    debugTelnet('client %s : is asking for account creation', clientSession.id);
                    clientSession.processRegistry.clear();
                    // client has entered the "new" word
                    // Will now branch to account creation process
                    clientSession.state = CLIENT_STATES.CREATE_ACCOUNT;
                    // And send a message
                    await this.createAccountProcess(clientSession);
                } else {
                    debugTelnet('client %s : submits username %s', clientSession.id, message);
                    // regular username
                    clientSession.login = message;
                    // prompt the "enter password" message
                    await this.askPassword(clientSession.id, 'welcome.password');
                    clientSession.processRegistry.set('phase', PHASES.EXPECT_PASSWORD);
                }
                break;
            }

            case PHASES.EXPECT_PASSWORD: {
                // exit password mode
                await this.exitPasswordMode(clientSession.id);
                // client is expected to enter password
                await this.setLoginPassword(clientSession.id, message);
                const user = this.getAuthenticatedUser(clientSession.id);
                if (user) {
                    // authentication ok
                    // send a welcome message
                    debugTelnet('client %s : is authenticated as %s', clientSession.id, user.name);
                    await this.sendMessage(clientSession.id, 'welcome.authenticated', {
                        name: user.name,
                    });
                    // Change client state
                    clientSession.state = CLIENT_STATES.AUTHENTICATED;
                } else {
                    debugTelnet('client %s : authentication failed', clientSession.id);
                    await this.pauseClient(clientSession.id, 1250);
                    await this.sendMessage(clientSession.id, 'welcome.badLogin');
                    await this.dropClient(clientSession.id);
                }
                clientSession.processRegistry.clear();
                break;
            }

            default: {
                break;
            }
        }
    }

    async createAccountProcess(clientSession: ClientSession, message: string = '') {
        enum PHASES {
            EXPECT_USERNAME,
            EXPECT_PASSWORD,
            EXPECT_CONFIRM_PASSWORD,
            EXPECT_EMAIL_ADDRESS,
            EXPECT_DISPLAY_NAME,
        }
        if (!clientSession.processRegistry.has('phase')) {
            // entering account creation process for the first time
            // displaying prompt, setting phase, and exit
            clientSession.processRegistry.set('phase', PHASES.EXPECT_USERNAME);
            const createUserDto: CreateUserDto = {
                name: '',
                displayName: '',
                email: '',
                password: '',
            };
            clientSession.processRegistry.set('createUserDto', createUserDto);
            return this.askString(clientSession.id, 'createNewAccount.username');
        }
        const createUserDto: CreateUserDto = clientSession.processRegistry.get(
            'createUserDto'
        )! as CreateUserDto;

        switch (clientSession.processRegistry.get('phase') as PHASES) {
            case PHASES.EXPECT_USERNAME: {
                // client is expected to enter username
                // check username at once for availability
                // if username already taken, send message, exit
                // if username valid : next phase
                if (!message.match(REGEX_USERNAME)) {
                    // the username is invalid
                    await this.sendMessage(clientSession.id, 'createNewAccount.usernameInvalid');
                    // another chance
                    return this.askString(clientSession.id, 'createNewAccount.username');
                } else if (await this.findUserByName(message)) {
                    // username already taken
                    await this.sendMessage(clientSession.id, 'createNewAccount.nameTaken');
                    // another chance
                    return this.askString(clientSession.id, 'createNewAccount.username');
                } else {
                    // username seems ok
                    createUserDto.name = message;
                    clientSession.processRegistry.set('phase', PHASES.EXPECT_PASSWORD);
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
                    clientSession.processRegistry.set('phase', PHASES.EXPECT_CONFIRM_PASSWORD);
                    createUserDto.password = message;
                }
                break;
            }

            case PHASES.EXPECT_CONFIRM_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message === createUserDto.password && message !== '') {
                    // passwords match
                    // go to the new phase
                    clientSession.processRegistry.set('phase', PHASES.EXPECT_EMAIL_ADDRESS);
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
                createUserDto.email = message;
                // goto next phase
                clientSession.processRegistry.set('phase', PHASES.EXPECT_DISPLAY_NAME);
                // now asking for display name
                await this.askString(clientSession.id, 'createNewAccount.displayName');
                break;
            }

            case PHASES.EXPECT_DISPLAY_NAME: {
                // Check if display name is valid
                // check if display anme is already taken
                // go to next phase
                if (message.match(REGEX_DISPLAYNAME)) {
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
                        createUserDto.displayName = message;
                        try {
                            const user = await this.createNewAccount(
                                clientSession.id,
                                createUserDto
                            );
                            if (user) {
                                // user creation seems ok
                                // We should ask for login now, with this new account
                                await this.sendMessage(
                                    clientSession.id,
                                    'createNewAccount.success',
                                    {
                                        name: createUserDto.name,
                                    }
                                );
                                clientSession.state = CLIENT_STATES.LOGIN;
                                clientSession.processRegistry.clear();
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
                    await this.sendMessage(clientSession.id, 'createNewAccount.displayName');
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
        enum PHASES {
            EXPECT_CURRENT_PASSWORD,
            EXPECT_NEW_PASSWORD,
            EXPECT_CONFIRM_PASSWORD,
        }
        type ChangePasswordStruct = {
            currentPassword: string;
            newPassword: string;
        };
        if (!clientSession.processRegistry.has('phase')) {
            clientSession.processRegistry.set('phase', PHASES.EXPECT_CURRENT_PASSWORD);
            const changePasswordStruct: ChangePasswordStruct = {
                currentPassword: '',
                newPassword: '',
            };
            clientSession.processRegistry.set('changePasswordStruct', changePasswordStruct);
            await this.askPassword(clientSession.id, 'changePassword.enterPreviousPassword');
        }
        const changePasswordStruct: ChangePasswordStruct = clientSession.processRegistry.get(
            'changePasswordStruct'
        )! as ChangePasswordStruct;

        switch (clientSession.processRegistry.get('phase')) {
            case PHASES.EXPECT_CURRENT_PASSWORD: {
                changePasswordStruct.currentPassword = message;
                await this.exitPasswordMode(clientSession.id);
                await this.askPassword(clientSession.id, 'changePassword.enterNewPassword');
                clientSession.processRegistry.set('phase', PHASES.EXPECT_NEW_PASSWORD);
                break;
            }
            case PHASES.EXPECT_NEW_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message == '') {
                    await this.sendMessage(clientSession.id, 'createNewAccount.emptyPassword');
                    await this.askPassword(clientSession.id, 'changePassword.enterNewPassword');
                } else {
                    changePasswordStruct.newPassword = message;
                    await this.askPassword(clientSession.id, 'changePassword.confirmNewPassword');
                    clientSession.processRegistry.set('phase', PHASES.EXPECT_CONFIRM_PASSWORD);
                }
                break;
            }
            case PHASES.EXPECT_CONFIRM_PASSWORD: {
                await this.exitPasswordMode(clientSession.id);
                if (message == changePasswordStruct.newPassword) {
                    // Client has confirmed new password
                    // Try to change password with use case
                    const bSuccess = await this.changePassword(
                        clientSession.id,
                        changePasswordStruct.newPassword,
                        changePasswordStruct.currentPassword
                    );
                    await this.sendMessage(
                        clientSession.id,
                        bSuccess ? 'changePassword.success' : 'changePassword.failure'
                    );
                } else {
                    await this.sendMessage(clientSession.id, 'changePassword.passwordMismatch');
                }
                clientSession.processRegistry.clear();
                clientSession.state = CLIENT_STATES.AUTHENTICATED;
                break;
            }
            default: {
                break;
            }
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
        const clientSession = this.initClientSession(clientSocket);
        const idClient = clientSession.id;
        const clientContext = clientSession.clientContext;
        const serverConfig = this.getServerConfig();
        const newAccountCode = serverConfig.getVariables().loginNewUser;
        await clientContext.print('server-welcome', {
            serverDescription: serverConfig.getVariables().description,
            serverVersion: serverConfig.getVariables().version,
            newAccountCode,
        });
        await this.echo(idClient, true);
        // Initializing loginProcess
        clientSession.processRegistry.clear();
        await this.loginProcess(clientSession);

        clientSocket.onMessage(async (message: string) => {
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
                        await this.execCommand(idClient, message);
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
        });
    }
}
