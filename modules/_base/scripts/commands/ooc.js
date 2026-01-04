// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { togglePrintChannel } = require('../includes/toggle-channel.js');

/**
 * Will send a public message (visible by all) to the public channel
 * public channel is open for all, to discuss about almost anything (mostly out of character discussions)
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    return togglePrintChannel(ctx, CHANNEL_DATA.OOC.channel, params.join(' ').trim());
}

module.exports = main(context, parameters);
