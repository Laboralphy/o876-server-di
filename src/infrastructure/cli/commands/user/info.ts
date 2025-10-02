import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import YAML from 'yaml';
import i18n from 'i18next';
const { t } = i18n;

interface IUserShowArgs extends Arguments {
    user: string;
}

export function infoCommand(yargs: Argv): Argv {
    return yargs.command<IUserShowArgs>(
        'info <user>',
        t('userInfoCmd.describe'),
        (yargs) =>
            yargs.positional('user', {
                type: 'string',
                describe: t('userInfoCmd.userOpt'),
                demandOption: true,
            }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                const userFull: User = await wfGet('users/' + user.id);
                const yamlStr = YAML.stringify(userFull, {
                    indent: 2,
                });
                console.log(yamlStr);
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
