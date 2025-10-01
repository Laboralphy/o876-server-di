import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initI18n } from './infrastructure/cli/tools/i18n-strings';
import { user } from './infrastructure/cli/commands/user';

async function main() {
    await initI18n();
    yargs(hideBin(process.argv))
        .locale('en')
        .command('user', 'User management', user)
        .help()
        .parseAsync()
        .catch((err) => {
            console.error('Error:', err.message);
            process.exit(1);
        });
}

main();
