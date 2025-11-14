import { Client as TelnetClient } from '../../../@types/telnet2';
import { TelnetClientSocket } from '../services/TelnetClientSocket';
import { AbstractClientController } from './AbstractClientController';
import { CLIENT_STATES } from '../../domain/enums/client-states';
import { CreateUserDto } from '../../application/dto/CreateUserDto';

/**
 * This class managed all inputs from client
 * This does not manage action from server to client
 * (example : kicking client, or sending message to client, except response)
 */
export class TelnetClientController extends AbstractClientController {
    async echo(idClient: string, b: boolean): Promise<void> {
        const csd = this.getClientSession(idClient);
        const clientSocket = csd.clientSocket;
        if (b) {
            await clientSocket.send(Buffer.from([0xff, 0xfc, 0x01])); // reactivate echo
        } else {
            await clientSocket.send(Buffer.from([0xff, 0xfb, 0x01])); // deactivate echo
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
                    case CLIENT_STATES.LOGIN_PROMPT_USERNAME: {
                        // when client enter newAccountCode
                        if (message == newAccountCode) {
                            await clientContext.sendMessage('createNewAccount.username', {
                                _nolf: true,
                            });
                            csd.state = CLIENT_STATES.CREATE_ACCOUNT_PROMPT_USERNAME;
                            break;
                        } else {
                            // Client is expected to send login username
                            await this.setLoginUsername(idClient, message);
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
                        await this.setLoginPassword(idClient, message);
                        const csdAfter = this.getClientSession(idClient);
                        if (csdAfter.state == CLIENT_STATES.AUTHENTICATED) {
                            // Here : The client is authenticated
                            await clientContext.sendMessage('welcome.authenticated', {
                                name: csdAfter.user!.displayName,
                            });
                        } else {
                            await clientContext.sendMessage('welcome.badLogin');
                            await this.pauseClient(idClient, 100);
                            await this.dropClient(idClient);
                            return;
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
