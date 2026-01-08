// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');
const aChannelData = Object.values(CHANNEL_DATA);
const oChannelCommandIndex = Object.fromEntries(aChannelData.map((c) => [c.channel, c.command]));
/**
 * Get a list of all channels the user has access
 * @param ctx {IClientContext}
 */
async function main(ctx) {
    const channelList = ctx.chat.getChannelList().map((c) => ({
        name: c.tag === '' ? c.id : c.tag,
        enabled: c.read,
        color: c.color,
        command: oChannelCommandIndex[c.id],
    }));
    if (!(await ctx.gmcp.send('Comm.Channel.List', channelList))) {
        await ctx.print('chat-channel-list', { channelList });
    }
}

module.exports = main(context);
