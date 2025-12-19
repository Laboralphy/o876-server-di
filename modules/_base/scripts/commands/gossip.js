/**
 * Will send a public message (visible by all) to the rumors channel
 * Most of the message post in this channel will be IC
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    ctx.chat.postMessage('rumors', params.join(' '));
}

main(context, parameters);
