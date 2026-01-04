// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { togglePrintChannel } = require('../includes/toggle-channel.js');

/**
 * Will send a message to the tech-channel
 * Tech channel is reserved for technical discussion, or bug reports, or anything related
 * to technology, game-mechanic and programming....
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    return togglePrintChannel(ctx, CHANNEL_DATA.TECH.channel, params.join(' ').trim());
}

module.exports = main(context, parameters);
