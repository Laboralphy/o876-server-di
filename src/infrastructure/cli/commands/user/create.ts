import { Argv, Arguments } from 'yargs';
import { HttpError, wfPost } from '../../tools/web-fetcher';
import { askPassword } from '../../../../libs/ask-password';
import { render } from '../../../../libs/i18n-loader';

interface IUserCreateArgs extends Arguments {
    name: string;
    email: string;
    displayName: string;
}

export function createCommand(yargs: Argv): Argv {
    return yargs.command<IUserCreateArgs>(
        'create <name>',
        render('userCreateCmd.describe'),
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: render('userCreateCmd.nameOpt'),
                    demandOption: true,
                })
                .option('email', {
                    type: 'string',
                    describe: render('userCreateCmd.emailOpt'),
                    alias: 'm',
                    demandOption: true,
                })
                .option('display-name', {
                    type: 'string',
                    describe: render('userCreateCmd.displayNameOpt'),
                    alias: 'd',
                    demandOption: true,
                }),
        async (argv) => {
            try {
                const password = await askPassword(
                    render('genericCmd.setPassword', { user: argv.name })
                );
                const repeatPassword = await askPassword(render('genericCmd.repeatPassword'));
                if (password !== repeatPassword) {
                    console.error(render('errors.passwordMismatch'));
                    return;
                }
                await wfPost('users', {
                    name: argv.name,
                    password,
                    email: argv.email,
                    displayName: argv.displayName,
                });
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
