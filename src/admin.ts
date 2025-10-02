import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initI18n } from './infrastructure/cli/tools/i18n-strings';
import { user } from './infrastructure/cli/commands/user';
import { getEnv } from './config/dotenv';

async function main() {
    const sLang = getEnv().I18N_LANGUAGE ?? 'en';
    await initI18n(sLang);
    yargs(hideBin(process.argv))
        .locale(sLang)
        .command('user', 'User management', user)
        .help()
        .parseAsync()
        .catch((err) => {
            console.error('Error:', err.message);
            process.exit(1);
        });
}

main();
