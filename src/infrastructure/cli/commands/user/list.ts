import { Argv, Arguments } from 'yargs';
import { TableRenderer, Themes } from '../../../../libs/table-renderer';
import { renderDate, renderDuration } from '../../../../libs/date-renderer';
import { UserListDto } from '../../../../application/dto/UserListDto';
import { wfGet } from '../../tools/web-fetcher';

interface IUserListArgs extends Arguments {
    filter: string;
}

export function listCommand(yargs: Argv): Argv {
    return yargs.command<IUserListArgs>(
        'list',
        'List users',
        (yargs) =>
            yargs.option('filter', {
                type: 'string',
                describe: "Filter user's name",
                alias: 'f',
                demandOption: false,
            }),
        async (argv) => {
            const userList = (await wfGet('users')) as UserListDto;
            const tr = new TableRenderer();
            tr.theme = Themes.filetThin;
            const nNow = Date.now();
            const output = userList
                .filter((user) => {
                    if (argv.filter) {
                        return user.name.includes(argv.filter);
                    } else {
                        return true;
                    }
                })
                .map((row) => [
                    row.id,
                    row.name,
                    renderDate(new Date(row.tsCreated)),
                    renderDuration(nNow - row.tsLogin),
                    row.email,
                ]);
            if (output.length > 0) {
                output.unshift(['id', 'name', 'date created', 'last login', 'email']);
                console.log(tr.render(output).join('\n'));
                console.log(userList.length, 'user(s)');
            } else {
                console.log('No user matching filter');
            }
        }
    );
}
