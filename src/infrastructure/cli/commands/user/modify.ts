import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet, wfPatch, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PatchUserDto } from '../../../web/dto/PatchUserDto';

interface IUserModifyArgs extends Arguments {
    uname: string;
    email?: string;
}

export function modifyCommand(yargs: Argv): Argv {
    return yargs.command<IUserModifyArgs>(
        'modify <username>',
        'Modify a user properties',
        (yargs) =>
            yargs
                .positional('username', {
                    type: 'string',
                    describe: "User's name",
                    demandOption: true,
                })
                .option('name', {
                    type: 'string',
                    describe: "User's new email address",
                    alias: 'm',
                    demandOption: false,
                })
                .option('email', {
                    type: 'string',
                    describe: "User's new email address",
                    alias: 'm',
                    demandOption: false,
                }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.uname);
                const oPayload: PatchUserDto = {};
                if (argv.email) {
                    oPayload.email = argv.email;
                }
                await wfPatch('users/' + user.id, oPayload);
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
