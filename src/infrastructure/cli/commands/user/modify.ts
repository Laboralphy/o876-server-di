import { Argv, Arguments } from 'yargs';
import { wfGet, wfPatch, wfPut } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PatchUserDto } from '../../../web/dto/PatchUserDto';

interface IUserModifyArgs extends Arguments {
    name: string;
    email?: string;
}

export function modifyCommand(yargs: Argv): Argv {
    return yargs.command<IUserModifyArgs>(
        'modify <name>',
        'Modify a user properties',
        (yargs) =>
            yargs
                .positional('name', {
                    type: 'string',
                    describe: "User's name",
                    demandOption: true,
                })
                .option('email', {
                    type: 'string',
                    describe: "User's new email address",
                    alias: 'm',
                    demandOption: false,
                }),
        async (argv) => {
            const user: User = await wfGet('users/name/' + argv.name);
            const oPayload: PatchUserDto = {};
            if (argv.email) {
                oPayload.email = argv.email;
            }
            await wfPatch('users/' + user.id, oPayload);
        }
    );
}
