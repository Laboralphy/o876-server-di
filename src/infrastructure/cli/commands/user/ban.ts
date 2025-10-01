import { Argv, Arguments } from 'yargs';
import { wfGet, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PutUserBanDto } from '../../../web/dto/PutUserBanDto';

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
        'Ban a user',
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: "User's name",
                    demandOption: true,
                })
                .option('days', {
                    type: 'number',
                    describe: 'Ban duration in days',
                    alias: 'd',
                    demandOption: false,
                    default: 0,
                })
                .option('hours', {
                    type: 'number',
                    describe: 'Ban duration in hours',
                    alias: 'h',
                    demandOption: false,
                    default: 0,
                })
                .option('minutes', {
                    type: 'number',
                    describe: 'Ban duration in minutes',
                    alias: 'm',
                    demandOption: false,
                    default: 0,
                })
                .option('reason', {
                    type: 'string',
                    describe: 'Reason why this user is banned',
                    alias: 'r',
                    demandOption: false,
                    default: '',
                }),
        async (argv) => {
            const user: User = await wfGet('users/name/' + argv.name);
            if (!user) {
                throw new Error(`User ${argv.name} not found`);
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
