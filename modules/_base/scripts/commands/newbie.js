const ESC = '\x1b';
const ANSI_COLOR_FG = '[38;5;';
const COLOR_ORANGE = ESC + ANSI_COLOR_FG + '208m';
const COLOR_GREEN = ESC + ANSI_COLOR_FG + '46m';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { togglePrintChannel } = require('../includes/toggle-channel');

/**
 * Will colorize text whereas it  ends with "?" or not
 * @param sText
 * @returns {string}
 */
function colorize(sText) {
    const s = sText.trim();
    if (s === '') {
        return '';
    } else if (s.endsWith('?')) {
        return COLOR_ORANGE + sText;
    } else {
        return COLOR_GREEN + sText;
    }
}

/**
 * This command will turn on and off the questions channels
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
async function main(ctx, params) {
    await togglePrintChannel(ctx, CHANNEL_DATA.NOOB.channel, colorize(params.join(' ')));
}

module.exports = main(context, parameters);
