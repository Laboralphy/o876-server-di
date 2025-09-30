import { Argv, Arguments } from 'yargs';
import { wfGet, wfPatch, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PutUserPasswordDto } from '../../../web/dto/PutUserPasswordDto';
import { askPassword } from '../../../../libs/ask-password';

interface IUserPasswordArgs extends Arguments {
    name: string;
    password: string;
}

export function passwordCommand(yargs: Argv): Argv {
    return yargs.command<IUserPasswordArgs>(
        'password <name>',
        'Set a new user password',
        (yargs) =>
            yargs.positional('name', {
                type: 'string',
                describe: "User's name",
                demandOption: true,
            }),
        async (argv) => {
            const { data } = await wfGet('users/name/' + argv.name);
            const user = data as User;
            const password = await askPassword(`Choose new password for user ${argv.name}: `);
            const repeatPassword = await askPassword('Repeat password: ');
            if (password !== repeatPassword) {
                console.error('Passwords are not matching.');
                return;
            }
            const oPayload: PutUserPasswordDto = {
                password,
            };
            await wfPut('users/' + user.id + '/password', oPayload);
        }
    );
}
