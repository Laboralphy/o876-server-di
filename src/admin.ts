import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { initI18nStrings } from './infrastructure/cli/tools/i18n-strings';
import { user } from './infrastructure/cli/commands/user';
import { getEnv } from './boot/dotenv';
import { render } from './libs/i18n-loader';

async function main() {
    const sLang = getEnv().SERVER_LANGUAGE ?? 'en';
    await initI18nStrings(sLang);
    yargs(hideBin(process.argv))
        .locale(sLang)
        .command('user', render('userCmd.describe'), user)
        .demandCommand(1)
        .help('help')
        .alias('h', 'help')
        .showHelpOnFail(true, render('helpOnFail.message'))
        .parseAsync()
        .catch((err) => {
            console.error('Error:', err.message);
            process.exit(1);
        });
}

main();
