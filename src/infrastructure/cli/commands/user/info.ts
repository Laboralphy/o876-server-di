import { Argv, Arguments } from 'yargs';
import { wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import YAML from 'yaml';

interface IUserShowArgs extends Arguments {
    name: string;
}

export function infoCommand(yargs: Argv): Argv {
    return yargs.command<IUserShowArgs>(
        'info <name>',
        "Show a user's information",
        (yargs) =>
            yargs.positional('name', {
                type: 'string',
                describe: "User's name",
                demandOption: true,
            }),
        async (argv) => {
            const user: User = await wfGet('users/name/' + argv.name);
            const userFull: User = await wfGet('users/' + user.id);
            const yamlStr = YAML.stringify(userFull, {
                indent: 2,
            });
            console.log(yamlStr);
        }
    );
}
