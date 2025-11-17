import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PutUserPasswordDto } from '../../../web/dto/PutUserPasswordDto';
import { askPassword } from '../../../../libs/ask-password';
import { render } from '../../../../libs/i18n-loader';

interface IUserPasswordArgs extends Arguments {
    user: string;
    password: string;
}

export function passwordCommand(yargs: Argv): Argv {
    return yargs.command<IUserPasswordArgs>(
        'password <user>',
        render('userPasswordCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: render('userPasswordCmd.userOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                const password = await askPassword(
                    render('genericCmd.setPassword', { user: argv.user })
                );
                const repeatPassword = await askPassword(render('genericCmd.repeatPassword'));
                if (password !== repeatPassword) {
                    console.error(render('errors.passwordMismatch'));
                    return;
                }
                const oPayload: PutUserPasswordDto = {
                    password,
                };
                await wfPut('users/' + user.id + '/password', oPayload);
            } catch (error) {
                if (error instanceof HttpError) {
                    console.error(
                        render('errors.apiError', {
                            code: error.statusCode,
                            message: error.message,
                        })
                    );
                } else {
                    throw error;
                }
            }
        }
    );
}
