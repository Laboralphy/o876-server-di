/**
 * @var context {IClientContext}
 * @var parameters {string[]}
 */

/**
 *
 * @param ctx {IClientContext}
 * @param params {string[]}
 * @returns {Promise<void>}
 */
async function main(ctx, params) {
    const tag = parseInt(params[0]);
    if (!isNaN(tag)) {
        await ctx.mail.setMessageFlags(tag, { deleted: true });
    } else {
        // first parameters needs to be a tag
        await ctx.print('mail.expectedTagParam');
    }
}

module.exports = main(context, parameters);
