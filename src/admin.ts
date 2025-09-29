import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { user } from './infrastructure/cli/commands/user';

yargs(hideBin(process.argv))
    .locale('en')
    .command('user', 'User management', user)
    .alias('h', 'help')
    .help()
    .parseAsync()
    .catch((err) => {
        console.error('Erreur:', err.message);
        process.exit(1);
    });
