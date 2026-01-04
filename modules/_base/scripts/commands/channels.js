// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
const aChannelData = Object.values(CHANNEL_DATA);
const oChannelCommandIndex = Object.fromEntries(aChannelData.map((c) => [c.channel, c.command]));
/**
 * Get a list of all channels the user has access
 * @param ctx {IClientContext}
 */
function main(ctx) {
    const channelList = ctx.chat.getChannelList().map((c) => ({
        name: c.tag === '' ? c.id : c.tag,
        enabled: c.read,
        command: oChannelCommandIndex[c.id],
    }));
    ctx.print('Comm.Channel.List', {
        _gmcp: channelList,
    });
    ctx.print('chat-channel-list', { channelList });
}

module.exports = main(context);
