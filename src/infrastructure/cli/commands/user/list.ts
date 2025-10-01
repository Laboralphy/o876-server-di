import { Argv, Arguments } from 'yargs';
import { TableRenderer, Themes } from '../../../../libs/table-renderer';
import { renderDate, renderDuration } from '../../../../libs/date-renderer';
import { wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';

interface IUserListArgs extends Arguments {
    filter: string;
    page: number;
    pagesize: number;
}

export function listCommand(yargs: Argv): Argv {
    return yargs.command<IUserListArgs>(
        'list',
        'List users',
        (yargs) =>
            yargs
                .option('filter', {
                    type: 'string',
                    describe: "Filter user's name",
                    default: '',
                    alias: 'f',
                    demandOption: false,
                })
                .option('page', {
                    type: 'number',
                    describe: 'Page number (starting page = 1 ; all pages = 0)',
                    alias: 'p',
                    default: 0,
                    demandOption: false,
                })
                .option('pagesize', {
                    type: 'number',
                    describe: 'Number of items per page',
                    alias: 's',
                    default: 25,
                    demandOption: false,
                }),
        async (argv) => {
            const userList: User[] = await wfGet('users');
            const filteredUserList = userList.filter((user) => {
                if (argv.filter) {
                    return user.name.includes(argv.filter);
                } else {
                    return true;
                }
            });
            const tr = new TableRenderer();
            tr.theme = Themes.filetThin;
            const nNow = Date.now();
            const bPaginationMode = filteredUserList.length > argv.pagesize && argv.page > 0;
            const nStart = bPaginationMode ? (argv.page - 1) * argv.pagesize : 0;
            const nCount = bPaginationMode ? argv.pagesize : Infinity;
            const nPageMax = bPaginationMode
                ? Math.ceil(filteredUserList.length / argv.pagesize)
                : 1;
            const output = filteredUserList
                .slice(nStart, nStart + nCount)
                .map((row) => [
                    row.id,
                    row.name,
                    renderDate(new Date(row.tsCreation)),
                    renderDuration(nNow - row.tsLastUsed),
                    row.email,
                    row.ban ? 'banned' : ' ',
                ]);
            if (output.length > 0) {
                output.unshift(['id', 'name', 'date created', 'last login', 'email', 'banned']);
                console.log(tr.render(output).join('\n'));
                if (bPaginationMode) {
                    console.log(
                        `Page ${argv.page} of ${nPageMax} (Users per page: ${argv.pagesize}). Total: ${filteredUserList.length} user${filteredUserList.length > 1 ? 's' : ''}.`
                    );
                } else {
                    console.log(
                        filteredUserList.length,
                        `user${filteredUserList.length > 1 ? 's' : ''}`
                    );
                }
            } else {
                console.log('No user matching filter');
            }
        }
    );
}
