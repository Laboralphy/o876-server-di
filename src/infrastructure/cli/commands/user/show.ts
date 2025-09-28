import { Argv, Arguments } from 'yargs';

interface IUserShowArgs extends Arguments {
    name: string;
}

export function showCommand(yargs: Argv): Argv {
    return yargs.command<IUserShowArgs>(
        'create <name>',
        'Modify a user',
        (yargs) =>
            yargs.positional('name', {
                type: 'string',
                describe: "User's name",
                demandOption: true,
            }),
        (argv) => {
            console.log('Show User name:', argv.name);
        }
    );
}
