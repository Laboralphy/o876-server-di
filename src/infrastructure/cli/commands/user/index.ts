import { Argv } from 'yargs';
import { createCommand } from './create';
import { deleteCommand } from './delete';
import { listCommand } from './list';
import { banCommand } from './ban';
import { unbanCommand } from './unban';
import { modifyCommand } from './modify';
import { infoCommand } from './info';
import { passwordCommand } from './password';

export function user(yargs: Argv) {
    createCommand(yargs);
    listCommand(yargs);
    modifyCommand(yargs);
    deleteCommand(yargs);
    infoCommand(yargs);
    banCommand(yargs);
    unbanCommand(yargs);
    passwordCommand(yargs);
}
