import { Argv, Arguments } from 'yargs';

interface IUserUnbanArgs extends Arguments {
    name: string;
}

// Fonction pour créer la commande
export function unbanCommand(yargs: Argv): Argv {
    return yargs.command<IUserUnbanArgs>(
        'unban <name>',
        'Unban a user',
        (yargs) =>
            yargs.positional('name', {
                type: 'string',
                describe: "User's name",
                demandOption: true,
            }),
        (argv) => {
            console.log('Unbanned User name:', argv.name);
        }
    );
}
