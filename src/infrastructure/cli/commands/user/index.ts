import { Argv } from 'yargs';
import { createCommand } from './create';
import { deleteCommand } from './delete';
import { listCommand } from './list';
import { banCommand } from './ban';
import { unbanCommand } from './unban';

export function user(yargs: Argv) {
    createCommand(yargs);
    deleteCommand(yargs);
    listCommand(yargs);
    banCommand(yargs);
    unbanCommand(yargs);
}
