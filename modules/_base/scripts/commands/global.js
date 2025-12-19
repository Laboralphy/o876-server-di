/**
 * Will send a public message (visible by all) to the global channel
 * global channel is open for all, to discuss about almost anything (mostly out of character discussions)
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    ctx.chat.postMessage('global', params.join(' '));
}

main(context, parameters);
