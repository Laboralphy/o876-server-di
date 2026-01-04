// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { togglePrintChannel } = require('../includes/toggle-channel.js');

/**
 * Will send a public message (visible by all) to the roleplay channel
 * roleplay channel is a public thematic channel with in-character discussions
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    return togglePrintChannel(ctx, CHANNEL_DATA.ROLEPLAY.channel, params.join(' ').trim());
}

module.exports = main(context, parameters);
