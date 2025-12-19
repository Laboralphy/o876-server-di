/**
 * Will send a public message (visible by all) to the bug report channel
 * Should be used to report bugs or anomalies
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    ctx.chat.postMessage('bugreports', params.join(' '));
}

main(context, parameters);
