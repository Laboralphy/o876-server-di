/**
 * Set channel active or not, send message to client to notify change
 * @param ctx {IClientContext}
 * @param channel {string}
 * @param value {boolean}
 */
function toggleChannel(ctx, channel, value) {
    ctx.chat.toggleChannel(channel, value);
    return ctx.print('chat-channel-toggle', { channel, value });
}

/**
 * Either toggle channel activation (if input text is empty
 * Or turn it off and print message
 * @param ctx {IClientContext}
 * @param channel {string}
 * @param sText {string}
 */
async function togglePrintChannel(ctx, channel, sText) {
    const bEnabled = ctx.chat.isChannelActive(channel);
    if (sText === '') {
        await toggleChannel(ctx, channel, !bEnabled);
    } else {
        if (!bEnabled) {
            toggleChannel(ctx, channel, true);
        }
        ctx.chat.postMessage(channel, sText);
    }
}

module.exports = {
    togglePrintChannel,
};
