import { Argv, Arguments } from 'yargs';
import { wfDelete, wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';

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
        async (argv) => {
            const user: User = await wfGet('users/name/' + argv.name);
            if (user) {
                await wfDelete('users/' + user.id);
            } else {
                console.error(`User ${argv.name} not found.`);
            }
        }
    );
}
