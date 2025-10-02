import { Argv, Arguments } from 'yargs';
import { HttpError, wfPost } from '../../tools/web-fetcher';
import { askPassword } from '../../../../libs/ask-password';
import i18n from 'i18next';
const { t } = i18n;

interface IUserCreateArgs extends Arguments {
    name: string;
    email: string;
}

export function createCommand(yargs: Argv): Argv {
    return yargs.command<IUserCreateArgs>(
        'create <name>',
        t('userCreateCmd.describe'),
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: t('userCreateCmd.nameOpt'),
                    demandOption: true,
                })
                .option('email', {
                    type: 'string',
                    describe: t('userCreateCmd.emailOpt'),
                    alias: 'm',
                    demandOption: true,
                }),
        async (argv) => {
            try {
                const password = await askPassword(
                    t('genericCmd.setPassword', { user: argv.name })
                );
                const repeatPassword = await askPassword(t('genericCmd.repeatPassword'));
                if (password !== repeatPassword) {
                    console.error(t('errors.passwordMismatch'));
                    return;
                }
                await wfPost('users', {
                    name: argv.name,
                    password,
                    email: argv.email,
                });
            } catch (error) {
                if (error instanceof HttpError) {
                    console.error(
                        t('errors.apiError', { code: error.statusCode, message: error.message })
                    );
                } else {
                    throw error;
                }
            }
        }
    );
}
