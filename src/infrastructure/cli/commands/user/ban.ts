import { Argv, Arguments } from 'yargs';
import { wfGet, wfPut, HttpError } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PutUserBanDto } from '../../../web/dto/PutUserBanDto';
import i18n from 'i18next';
import { render } from '../../../../libs/i18n-loader';

interface IUserBanArgs extends Arguments {
    user: string;
    days: number;
    hours: number;
    minutes: number;
    reason: string;
}

// Fonction pour créer la commande
export function banCommand(yargs: Argv): Argv {
    return yargs.command<IUserBanArgs>(
        'ban <user>',
        render('userBanCmd.describe'),
        (yargs) =>
            yargs
                .positional('user', {
                    type: 'string',
                    describe: render('userBanCmd.userOpt'),
                    demandOption: true,
                })
                .option('days', {
                    type: 'number',
                    describe: render('userBanCmd.daysOpt'),
                    alias: 'd',
                    demandOption: false,
                    default: 0,
                })
                .option('hours', {
                    type: 'number',
                    describe: render('userBanCmd.hoursOpt'),
                    demandOption: false,
                    default: 0,
                })
                .option('minutes', {
                    type: 'number',
                    describe: render('userBanCmd.minutesOpt'),
                    alias: 'm',
                    demandOption: false,
                    default: 0,
                })
                .option('reason', {
                    type: 'string',
                    describe: render('userBanCmd.reasonOpt'),
                    alias: 'r',
                    demandOption: false,
                    default: '',
                }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
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
