import { Argv, Arguments } from 'yargs';
import { HttpError, wfDelete, wfGet } from '../../tools/web-fetcher';
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
            try {
                const user: User = await wfGet('users/name/' + argv.name);
                await wfDelete('users/' + user.id);
            } catch (error) {
                if (error instanceof HttpError) {
                    console.error(`Error ${error.statusCode}: ${error.message}`);
                } else {
                    throw error;
                }
            }
        }
    );
}
