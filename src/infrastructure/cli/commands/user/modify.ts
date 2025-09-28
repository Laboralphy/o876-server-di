import { Argv, Arguments } from 'yargs';

interface IUserModifyArgs extends Arguments {
    name: string;
    password: string;
    email: string;
}

export function modifyCommand(yargs: Argv): Argv {
    return yargs.command<IUserModifyArgs>(
        'create <name>',
        'Modify a user',
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: "User's name",
                    demandOption: true,
                })
                .option('password', {
                    type: 'string',
                    describe: "User's new password",
                    alias: 'p',
                    demandOption: false,
                })
                .option('email', {
                    type: 'string',
                    describe: "User's new email address",
                    alias: 'm',
                    demandOption: false,
                }),
        (argv) => {
            console.log('Modify User name:', argv.name);
            console.log('Password:', argv.password);
            console.log('Email:', argv.email);
        }
    );
}
