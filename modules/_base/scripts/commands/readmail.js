/**
 * @var context {IClientContext}
 */
async function main(ctx) {
    await ctx.mail.readMessage(1);
}

module.exports = main(context);
