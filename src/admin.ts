import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initI18nStrings } from './infrastructure/cli/tools/i18n-strings';
import { user } from './infrastructure/cli/commands/user';
import { getEnv } from './config/dotenv';

async function main() {
    const sLang = getEnv().I18N_LANGUAGE ?? 'en';
    const t = await initI18nStrings(sLang);
    yargs(hideBin(process.argv))
        .locale(sLang)
        .command('user', t('userCmd.describe'), user)
        .help()
        .parseAsync()
        .catch((err) => {
            console.error('Error:', err.message);
            process.exit(1);
        });
}

main();
