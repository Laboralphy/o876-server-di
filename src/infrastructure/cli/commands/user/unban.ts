import { Argv, Arguments } from 'yargs';
import { User } from '../../../../domain/entities/User';
import { HttpError, wfGet, wfPut } from '../../tools/web-fetcher';

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
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.name);
                await wfPut('users/' + user.id + '/unban', {});
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
