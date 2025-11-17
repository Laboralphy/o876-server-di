import { Client as TelnetClient } from '../../../@types/telnet2';
import { TelnetClientSocket } from '../services/TelnetClientSocket';
import { AbstractClientController } from './AbstractClientController';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { CreateUserDto } from '../../application/dto/CreateUserDto';
import { ClientSession } from '../../domain/types/ClientSession';
import { PasswordChangeProcessor } from '../controller-message-processor/PasswordChangeProcessor';
import { LoginProcessor } from '../controller-message-processor/LoginProcessor';
import { CreateAccountProcessor } from '../controller-message-processor/CreateAccountProcessor';

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
    async echo(idClient: string, b: boolean): Promise<void> {
        return echo(this.getClientSession(idClient), b);
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
        const newAccountCode = serverConfig.getConfigVariableString('loginNewUser');
        await clientContext.sendMessage('server-welcome', {
            serverDescription: serverConfig.getConfigVariableString('description'),
            serverVersion: serverConfig.getConfigVariableString('version'),
            newAccountCode,
        });
        await clientContext.sendMessage('welcome.login', { _nolf: true });
        await this.echo(idClient, true);
        const accountCreation: CreateUserDto = {
            name: '',
            email: '',
            displayName: '',
            password: '',
        };
        let passwordChangeProcessor: PasswordChangeProcessor | null = null;
        let loginProcessor: LoginProcessor | null = null;
        let createAccountProcessor: CreateAccountProcessor | null = null;
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
                        if (!loginProcessor) {
                            loginProcessor = new LoginProcessor(clientSession, newAccountCode);
                        }
                        if (loginProcessor) {
                            const status = await loginProcessor.processMessage(message);
                            if (status.createAccount) {
                                // client has type "new" and wants to create a new account
                                csd.state = CLIENT_STATES.CREATE_ACCOUNT;
                                loginProcessor = null;
                            } else if (status.success) {
                                // client has enter login/password
                                // we must check and authenticate client
                                const bAuthenticated = await this.setLoginPassword(
                                    status.login,
                                    status.password
                                );
                                if (bAuthenticated) {
                                    csd.state = CLIENT_STATES.AUTHENTICATED;
                                } else {
                                    // Authentication failed
                                    // Just drop the client
                                    await this.dropClient(idClient);
                                }
                                loginProcessor = null;
                            } else if (status.failure) {
                                // Don't know why, but login failed
                                // just drop the client
                                await this.dropClient(idClient);
                                loginProcessor = null;
                            }
                        }
                        break;
                    }

                    case CLIENT_STATES.CREATE_ACCOUNT: {
                        if (!createAccountProcessor) {
                            createAccountProcessor = new CreateAccountProcessor(clientSession);
                        }
                        if (createAccountProcessor) {
                            const status = await createAccountProcessor.processMessage(message);
                            const { success, failure, password, name, displayName, email } = status;
                            const user = await this.createNewAccount(idClient, {
                                name,
                                password,
                                email,
                                displayName,
                            });
                            if (user) {
                                // account creation success
                            } else {
                                // account creation failed
                            }
                        }
                        break;
                    }

                    case CLIENT_STATES.LOGIN_PROMPT_USERNAME: {
                        if (message == newAccountCode) {
                            // client has entered a "new" message
                            // this will begin the account creation process
                            await clientContext.sendMessage('createNewAccount.username', {
                                _nolf: true,
                            });
                            csd.state = CLIENT_STATES.CREATE_ACCOUNT_PROMPT_USERNAME;
                            break;
                        } else {
                            // Client is expected to send login username
                            csd.login = message;
                            // debugClient('client %s login : %s', idClient, username);
                            csd.state = CLIENT_STATES.LOGIN_PROMPT_PASSWORD;
                            // Prompting for password
                            await clientContext.sendMessage('welcome.password', { _nolf: true });
                            await this.echo(idClient, false);
                        }
                        break;
                    }

                    case CLIENT_STATES.LOGIN_PROMPT_PASSWORD: {
                        // client is expected to send password
                        await this.echo(idClient, true);
                        await clientSocket.send('\n');
                        if (await this.setLoginPassword(idClient, message)) {
                            const csdAfter = this.getClientSession(idClient);
                            await clientContext.sendMessage('welcome.authenticated', {
                                name: csdAfter.user!.displayName,
                            });
                        } else {
                            // something wrong happended
                            await clientContext.sendMessage('welcome.badLogin');
                            await this.pauseClient(idClient, 100);
                            await this.dropClient(idClient);
                        }
                        break;
                    }

                    case CLIENT_STATES.CREATE_ACCOUNT_PROMPT_USERNAME: {
                        // client is expected to send new account username
                        // first : check if user name is already taken
                        const userTestDN = await this.findUserByName(message);
                        if (userTestDN !== undefined) {
                            await clientContext.sendMessage('createNewAccount.nameTaken');
                            await clientContext.sendMessage('createNewAccount.username', {
                                _nolf: true,
                            });
                            return;
                        }
                        accountCreation.name = message;
                        await clientContext.sendMessage('createNewAccount.password', {
                            _nolf: true,
                        });
                        csd.state = CLIENT_STATES.CREATE_ACCOUNT_PROMPT_PASSWORD;
                        await this.echo(idClient, false);
                        break;
                    }

                    case CLIENT_STATES.CREATE_ACCOUNT_PROMPT_PASSWORD: {
                        // client is expected to send new account password
                        // empty password are ignored
                        await this.echo(idClient, true);
                        await clientSocket.send('\n');
                        if (accountCreation.password == '') {
                            // this was the first password
                            accountCreation.password = message;
                            await clientContext.sendMessage('createNewAccount.confirmPassword', {
                                _nolf: true,
                            });
                            // remain in the same state, waiting for password confirmation
                            await this.echo(idClient, false);
                            // Now awaiting password confirmation
                            break;
                        }
                        if (accountCreation.password == message) {
                            // Password is confirmed
                            await clientContext.sendMessage('createNewAccount.email', {
                                _nolf: true,
                            });
                            csd.state = CLIENT_STATES.CREATE_ACCOUNT_PROMPT_EMAIL;
                        } else {
                            // password is not confirmed
                            await clientContext.sendMessage('createNewAccount.passwordMismatch');
                            await this.pauseClient(idClient, 100);
                            await this.dropClient(idClient);
                        }
                        break;
                    }

                    case CLIENT_STATES.CREATE_ACCOUNT_PROMPT_EMAIL: {
                        // client is expected to send new account email address
                        accountCreation.email = message;
                        await clientContext.sendMessage('createNewAccount.displayName', {
                            _nolf: true,
                        });
                        csd.state = CLIENT_STATES.CREATE_ACCOUNT_PROMPT_DISPLAYNAME;
                        break;
                    }

                    case CLIENT_STATES.CREATE_ACCOUNT_PROMPT_DISPLAYNAME: {
                        // client is expected to send new account display name
                        const userTestDN = await this.findUserByDisplayName(message);
                        if (userTestDN !== undefined) {
                            await clientContext.sendMessage('createNewAccount.displayNameTaken');
                            await clientContext.sendMessage('createNewAccount.displayName', {
                                _nolf: true,
                            });
                            return;
                        }
                        accountCreation.displayName = message;
                        await this.createNewAccount(idClient, accountCreation);
                        const user = this.getAuthenticatedUser(idClient);
                        if (user) {
                            await clientContext.sendMessage('createNewAccount.success', {
                                name: user.displayName,
                            });
                            csd.state = CLIENT_STATES.LOGIN_PROMPT_USERNAME;
                            csd.login = '';
                            await clientContext.sendMessage('welcome.login', { _nolf: true });
                        } else {
                            await clientContext.sendMessage('createNewAccount.failure');
                            await this.pauseClient(idClient, 100);
                            await this.dropClient(idClient);
                        }
                        break;
                    }

                    case CLIENT_STATES.AUTHENTICATED: {
                        // When client is authenticated, all message are passed to th command interpreter
                        await this.execCommand(idClient, message);
                        break;
                    }

                    case CLIENT_STATES.CHANGE_PASSWORD_PROMPT: {
                        if (!passwordChangeProcessor) {
                            passwordChangeProcessor = new PasswordChangeProcessor(clientSession);
                        }
                        if (passwordChangeProcessor) {
                            const { success, failure } =
                                await passwordChangeProcessor.processMessage(message);
                            if (success) {
                                // Lets try to update password
                                // call use case
                                //then revert to lobby state
                                csd.state = CLIENT_STATES.AUTHENTICATED;
                            } else if (failure) {
                                // revert to lobby state
                                csd.state = CLIENT_STATES.AUTHENTICATED;
                            }
                        }
                        break;
                    }

                    default: {
                        // Unexpected client state
                        // Destroying client
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
