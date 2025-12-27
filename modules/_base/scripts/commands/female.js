/**
 *
 * @param ctx {IClientContext}
 */
async function main(ctx) {
    await ctx.user.setUserFemale(ctx.user.self, !ctx.user.self.female);
    await ctx.print('female', { context: ctx.user.self.female ? 'female' : 'male' });
}

module.exports = main(context);
