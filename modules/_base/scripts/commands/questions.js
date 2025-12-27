/**
 * This command will turn on and off the questions channels
 * @param ctx {IClientContext}
 */

function main(ctx) {
    const CHANNEL = 'questions';
    const bValue = !ctx.chat.isChannelActive(CHANNEL);
    ctx.chat.switchChannel(CHANNEL, bValue);
    const bNowValue = ctx.chat.isChannelActive(CHANNEL);
    return ctx.print('chat-channel-switch', { channel: CHANNEL, value: bNowValue });
}

module.exports = main(context);
