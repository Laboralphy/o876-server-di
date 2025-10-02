import { Argv, Arguments } from 'yargs';
import { User } from '../../../../domain/entities/User';
import { HttpError, wfGet, wfPut } from '../../tools/web-fetcher';
import i18n from 'i18next';
const { t } = i18n;

interface IUserUnbanArgs extends Arguments {
    user: string;
}

// Fonction pour créer la commande
export function unbanCommand(yargs: Argv): Argv {
    return yargs.command<IUserUnbanArgs>(
        'unban <user>',
        t('userUnbanCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: t('userUnbanCmd.userOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                await wfPut('users/' + user.id + '/unban', {});
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
