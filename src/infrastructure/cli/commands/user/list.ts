import { Argv, Arguments } from 'yargs';
import { TableRenderer, Themes } from '../../../../libs/table-renderer';
import { renderDate } from '../../../../libs/date-renderer';
import { HttpError, wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import i18n from 'i18next';
const { t } = i18n;

interface IUserListArgs extends Arguments {
    filter: string;
    page: number;
    pagesize: number;
}

export function listCommand(yargs: Argv): Argv {
    return yargs.command<IUserListArgs>(
        'list',
        t('userListCmd.describe'),
        (yargs) =>
            yargs
                .option('filter', {
                    type: 'string',
                    describe: t('userListCmd.filterOpt'),
                    default: '',
                    alias: 'f',
                    demandOption: false,
                })
                .option('page', {
                    type: 'number',
                    describe: t('userListCmd.pageOpt'),
                    alias: 'p',
                    default: 0,
                    demandOption: false,
                })
                .option('pagesize', {
                    type: 'number',
                    describe: t('userListCmd.describe'),
                    alias: 's',
                    default: 25,
                    demandOption: false,
                }),
        async (argv) => {
            try {
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
                const bPaginationMode = filteredUserList.length > argv.pagesize && argv.page > 0;
                const nStart = bPaginationMode ? (argv.page - 1) * argv.pagesize : 0;
                const nCount = bPaginationMode ? argv.pagesize : Infinity;
                const nPageMax = bPaginationMode
                    ? Math.ceil(filteredUserList.length / argv.pagesize)
                    : 1;
                const sBanned = t('userListCmd.listLabelBanned');
                const sNotBanned = ' ';
                const output = filteredUserList
                    .slice(nStart, nStart + nCount)
                    .map((row) => [
                        row.id,
                        row.name,
                        renderDate(new Date(row.tsCreation)),
                        renderDate(new Date(row.tsLastUsed), 'ymd hm'),
                        row.ban ? sBanned : sNotBanned,
                    ]);
                if (output.length > 0) {
                    output.unshift([
                        t('userListCmd.listLabelId'),
                        t('userListCmd.listLabelName'),
                        t('userListCmd.listLabelDateCreated'),
                        t('userListCmd.listLabelLastLogin'),
                        t('userListCmd.listLabelBanned'),
                    ]);
                    console.log(tr.render(output).join('\n'));
                    if (bPaginationMode) {
                        console.log(
                            t('userListCmd.listPage', {
                                page: argv.page,
                                max: nPageMax,
                                pagesize: argv.pagesize,
                                count: filteredUserList.length,
                            })
                        );
                    } else {
                        console.log(
                            t('userListCmd.listUserCount', { count: filteredUserList.length })
                        );
                    }
                } else {
                    console.log(t('userListCmd.listNoUser'));
                }
            } catch (error) {
                if (error instanceof HttpError) {
                    console.error(
                        t('errors.apiError', { code: error.statusCode, message: error.message })
                    );
                } else {
                    throw error;
                }
            }
        }
    );
}
