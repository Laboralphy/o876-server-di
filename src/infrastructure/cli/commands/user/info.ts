import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import YAML from 'yaml';
import { render } from '../../../../libs/i18n-loader';

interface IUserShowArgs extends Arguments {
    user: string;
}

export async function fetchUserInfo(username: string) {
    const user: User = await wfGet('users/name/' + username);
    const userFull: User = await wfGet('users/' + user.id);
    return YAML.stringify(userFull, {
        indent: 2,
    });
}

export function infoCommand(yargs: Argv): Argv {
    return yargs.command<IUserShowArgs>(
        'info <user>',
        render('userInfoCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: render('userInfoCmd.userOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const yamlStr = await fetchUserInfo(argv.user);
                console.log(yamlStr);
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
