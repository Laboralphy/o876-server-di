import { Argv, Arguments } from 'yargs';
import { wfPost } from '../../tools/web-fetcher';
import { askPassword } from '../../../../libs/ask-password';

interface IUserCreateArgs extends Arguments {
    name: string;
    email: string;
}

export function createCommand(yargs: Argv): Argv {
    return yargs.command<IUserCreateArgs>(
        'create <name>',
        'Create a new user',
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: "User's name",
                    demandOption: true,
                })
                .option('email', {
                    type: 'string',
                    describe: "User's email address",
                    alias: 'm',
                    demandOption: true,
                }),
        async (argv) => {
            const password = await askPassword(`Choose a password for user ${argv.name}: `);
            const repeatPassword = await askPassword('Repeat password: ');
            if (password !== repeatPassword) {
                console.error('Passwords are not matching.');
                return;
            }
            await wfPost('users', {
                name: argv.name,
                password,
                email: argv.email,
            });
        }
    );
}
