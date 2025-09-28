import { Argv, Arguments } from 'yargs';

interface IUserDeleteArgs extends Arguments {
    name: string;
}

export function deleteCommand(yargs: Argv): Argv {
    return yargs.command<IUserDeleteArgs>(
        'delete <name>',
        'Delete a user',
        (yargs) =>
            yargs.positional('name', {
                type: 'string',
                describe: "User's name",
                demandOption: true,
            }),
        (argv) => {
            console.log('Delete User:', argv.name);
        }
    );
}
