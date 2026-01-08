// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { togglePrintChannel } = require('../includes/toggle-channel');

/**
 * This command will turn on and off the questions channels
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
async function main(ctx, params) {
    await togglePrintChannel(ctx, CHANNEL_DATA.NOOB.channel, params.join(' '));
}

module.exports = main(context, parameters);
