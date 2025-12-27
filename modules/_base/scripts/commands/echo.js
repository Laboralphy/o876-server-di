/**
 * Will send the parameters back to client
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
async function main(ctx, params) {
    await ctx.print(params.join(' '));
}

main(context, parameters);
