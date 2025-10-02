import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet, wfPatch } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PatchUserDto } from '../../../web/dto/PatchUserDto';
import i18n from 'i18next';
const { t } = i18n;

interface IUserModifyArgs extends Arguments {
    user: string;
    email?: string;
    name?: string;
}

export function modifyCommand(yargs: Argv): Argv {
    return yargs.command<IUserModifyArgs>(
        'modify <user>',
        t('userModifyCmd.describe'),
        (yargs) =>
            yargs
                .positional('user', {
                    type: 'string',
                    describe: t('userModifyCmd.userOpt'),
                    demandOption: true,
                })
                .option('name', {
                    type: 'string',
                    describe: t('userModifyCmd.nameOpt'),
                    alias: 'n',
                    demandOption: false,
                })
                .option('email', {
                    type: 'string',
                    describe: t('userModifyCmd.emailOpt'),
                    alias: 'm',
                    demandOption: false,
                }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                const oPayload: PatchUserDto = {};
                if (argv.email) {
                    oPayload.email = argv.email;
                }
                await wfPatch('users/' + user.id, oPayload);
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
