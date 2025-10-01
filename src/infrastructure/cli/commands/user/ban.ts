import { Argv, Arguments } from 'yargs';
import { wfGet, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PutUserBanDto } from '../../../web/dto/PutUserBanDto';
import i18n from 'i18next';

const { t } = i18n;

interface IUserBanArgs extends Arguments {
    name: string;
    days: number;
    hours: number;
    minutes: number;
    reason: string;
}

// Fonction pour créer la commande
export function banCommand(yargs: Argv): Argv {
    return yargs.command<IUserBanArgs>(
        'ban <name>',
        t('banCmd.describe'),
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: t('banCmd.nameOpt'),
                    demandOption: true,
                })
                .option('days', {
                    type: 'number',
                    describe: t('banCmd.daysOpt'),
                    alias: 'd',
                    demandOption: false,
                    default: 0,
                })
                .option('hours', {
                    type: 'number',
                    describe: t('banCmd.hoursOpt'),
                    alias: 'h',
                    demandOption: false,
                    default: 0,
                })
                .option('minutes', {
                    type: 'number',
                    describe: t('banCmd.minutesOpt'),
                    alias: 'm',
                    demandOption: false,
                    default: 0,
                })
                .option('reason', {
                    type: 'string',
                    describe: t('banCmd.reasonOpt'),
                    alias: 'r',
                    demandOption: false,
                    default: '',
                }),
        async (argv) => {
            const user: User = await wfGet('users/name/' + argv.name);
            if (!user) {
                throw new Error(t('errors.unknownUserErr', { name: argv.name }));
            }
            const forever: boolean = argv.days == 0 && argv.hours == 0 && argv.minutes == 0;
            const oPayload: PutUserBanDto = {
                reason: argv.reason,
                forever,
            };
            if (!forever) {
                oPayload.duration = {
                    days: argv.days,
                    hours: argv.hours,
                    minutes: argv.minutes,
                };
            }
            await wfPut('users/' + user.id + '/ban', oPayload);
        }
    );
}
