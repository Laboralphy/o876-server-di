import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet, wfPatch, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PutUserPasswordDto } from '../../../web/dto/PutUserPasswordDto';
import { askPassword } from '../../../../libs/ask-password';
import i18n from 'i18next';
const { t } = i18n;

interface IUserPasswordArgs extends Arguments {
    user: string;
    password: string;
}

export function passwordCommand(yargs: Argv): Argv {
    return yargs.command<IUserPasswordArgs>(
        'password <user>',
        t('userPasswordCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: t('userPasswordCmd.userOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                const password = await askPassword(
                    t('genericCmd.setPassword', { user: argv.user }) + ': '
                );
                const repeatPassword = await askPassword(t('genericCmd.repeatPassword') + ': ');
                if (password !== repeatPassword) {
                    console.error(t('errors.passwordMismatch'));
                    return;
                }
                const oPayload: PutUserPasswordDto = {
                    password,
                };
                await wfPut('users/' + user.id + '/password', oPayload);
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
