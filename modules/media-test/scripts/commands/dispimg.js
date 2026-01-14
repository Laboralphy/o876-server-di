/**
 *
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
async function main(ctx, params) {
    await ctx.gmcp.sendMediaFile('image', params[1], params[0]);
}

module.exports = main(context, parameters);
