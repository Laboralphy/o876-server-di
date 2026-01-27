import { Arguments, Argv } from 'yargs';
import { User } from '../../../../domain/entities/User';
import { HttpError, wfGet, wfPut } from '../../tools/web-fetcher';
import { render } from '../../../../libs/i18n-loader';

interface IUserUnbanArgs extends Arguments {
    user: string;
}

// Fonction pour créer la commande
export function unbanCommand(yargs: Argv): Argv {
    return yargs.command<IUserUnbanArgs>(
        'unban <user>',
        render('userUnbanCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: render('userUnbanCmd.userOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                await wfPut('users/' + user.id + '/unban', {});
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
