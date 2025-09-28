import { Argv, Arguments } from 'yargs';

interface IUserBanArgs extends Arguments {
    name: string;
    duration: string;
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
                .option('duration', {
                    type: 'string',
                    describe: 'Ban duration',
                    alias: 'd',
                    demandOption: false,
                    default: 'forever',
                })
                .option('reason', {
                    type: 'string',
                    describe: 'Reason why this user is banned',
                    alias: 'r',
                    demandOption: false,
                    default: '',
                }),
        (argv) => {
            console.log('Banned User name:', argv.name);
            console.log('Duration:', argv.duration);
            console.log('Email:', argv.email);
        }
    );
}
