/**
 * Will send a public message (visible by all) to the info channel
 * This command is only available for administrator or game_masters
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    ctx.chat.postMessage('bugreports', params.join(' '));
}

main(context, parameters);
