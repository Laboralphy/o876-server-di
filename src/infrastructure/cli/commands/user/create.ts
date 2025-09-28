import { Argv, Arguments } from 'yargs';
import { CreateUserDto, CreateUserDtoSchema } from '../../../../application/dto/CreateUserDto';
import { container } from '../../../../config/container';
import { wfPost } from '../../tools/web-fetcher';

interface IUserCreateArgs extends Arguments {
    name: string;
    password: string;
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
                .option('password', {
                    type: 'string',
                    describe: "User's password",
                    alias: 'p',
                    demandOption: true,
                })
                .option('email', {
                    type: 'string',
                    describe: "User's email address",
                    alias: 'm',
                    demandOption: true,
                }),
        async (argv) => {
            await wfPost('users', {
                name: argv.name,
                password: argv.password,
                email: argv.email,
            });
        }
    );
}
