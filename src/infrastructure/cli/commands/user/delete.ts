import { Argv, Arguments } from 'yargs';
import { HttpError, wfDelete, wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import i18n from 'i18next';
const { t } = i18n;

interface IUserDeleteArgs extends Arguments {
    user: string;
}

export function deleteCommand(yargs: Argv): Argv {
    return yargs.command<IUserDeleteArgs>(
        'delete <user>',
        t('userDeleteCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: t('userDeleteCmd.nameOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                await wfDelete('users/' + user.id);
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
