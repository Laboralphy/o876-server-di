/**
 * Get a list of all channels the user has access
 * @param ctx {IClientContext}
 */
function main(ctx) {
    const channelList = ctx.chat.getChannelList().map((c) => ({
        name: c.tag === '' ? c.id : c.tag,
        enabled: c.read,
        command: '',
    }));
    ctx.print('Comm.Channel.List', {
        _gmcp: [],
    });
    ctx.print('chat-channel-list', { channelList });
}

module.exports = main(context);
