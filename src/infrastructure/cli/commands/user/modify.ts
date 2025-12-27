import { Argv, Arguments } from 'yargs';
import { HttpError, wfGet, wfPatch } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import { PatchUserDto } from '../../../web/dto/PatchUserDto';
import { render } from '../../../../libs/i18n-loader';
import { ROLES } from '../../../../domain/enums/roles';
import { fetchUserInfo } from './info';

interface IUserModifyArgs extends Arguments {
    user: string;
    email?: string;
    name?: string;
    displayname?: string;
    grant?: 'm' | 'g' | 'a';
    revoke?: 'm' | 'g' | 'a';
}

export function modifyCommand(yargs: Argv): Argv {
    return yargs.command<IUserModifyArgs>(
        'modify <user>',
        render('userModifyCmd.describe'),
        (yargs) =>
            yargs
                .positional('user', {
                    type: 'string',
                    describe: render('userModifyCmd.userOpt'),
                    demandOption: true,
                })
                .option('name', {
                    type: 'string',
                    describe: render('userModifyCmd.nameOpt'),
                    alias: 'n',
                    demandOption: false,
                })
                .option('email', {
                    type: 'string',
                    describe: render('userModifyCmd.emailOpt'),
                    alias: 'm',
                    demandOption: false,
                })
                .option('displayname', {
                    type: 'string',
                    describe: render('userModifyCmd.displayNameOpt'),
                    alias: 'd',
                    demandOption: false,
                })
                .option('grant', {
                    type: 'string',
                    choices: ['m', 'g', 'a'],
                    describe: render('userModifyCmd.grantOpt'),
                    alias: 'g',
                    demandOption: false,
                })
                .option('revoke', {
                    type: 'string',
                    choices: ['m', 'g', 'a'],
                    describe: render('userModifyCmd.revokeOpt'),
                    alias: 'r',
                    demandOption: false,
                }),
        async (argv) => {
            try {
                const user: User = await wfGet('users/name/' + argv.user);
                const oPayload: PatchUserDto = {};
                if (argv.email) {
                    oPayload.email = argv.email;
                }
                if (argv.displayname) {
                    oPayload.displayName = argv.displayname;
                }
                const roles = new Set<ROLES>(user.roles);
                switch (argv.grant) {
                    case 'a': {
                        roles.add(ROLES.ADMIN);
                        break;
                    }
                    case 'g': {
                        roles.add(ROLES.GAME_MASTER);
                        break;
                    }
                    case 'm': {
                        roles.add(ROLES.MODERATOR);
                        break;
                    }
                    default: {
                        break;
                    }
                }
                switch (argv.revoke) {
                    case 'a': {
                        roles.delete(ROLES.ADMIN);
                        break;
                    }
                    case 'g': {
                        roles.delete(ROLES.GAME_MASTER);
                        break;
                    }
                    case 'm': {
                        roles.delete(ROLES.MODERATOR);
                        break;
                    }
                    default: {
                        break;
                    }
                }
                oPayload.roles = Array.from(roles);
                await wfPatch('users/' + user.id, oPayload);
                console.log(await fetchUserInfo(argv.user));
            } catch (error) {
                if (error instanceof HttpError) {
                    console.error(
                        render('errors.apiError', {
                            code: error.statusCode,
                            message: error.message,
                        })
                    );
                } else {
                    throw error;
                }
            }
        }
    );
}
