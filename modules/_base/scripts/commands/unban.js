/**
 * Unbans a user.
 * first parameter : user to ban
 * second parameter : duration
 * third parameter : reason
 *
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
async function main(ctx, params) {
    // the command is for moderator only
    if (!ctx.user.isModerator()) {
        await ctx.print('error.commandModeratorOnly');
        return;
    }
    const [sUser] = params;
    const oUserToUnban = await ctx.user.find(sUser);
    if (!oUserToUnban) {
        await ctx.print('error.userNotFound', { name: sUser });
        return;
    }
    const sFemale = oUserToUnban.female ? 'female' : 'male';
    if (!oUserToUnban.ban) {
        await ctx.print('userUnbanned', { name: sUser, context: sFemale });
    }
    await ctx.user.unban(oUserToUnban);
    ctx.chat.postMessage(
        'info',
        ctx.strref('userUnbanned.broadcast', { name: oUserToUnban.displayName, context: sFemale })
    );
}

module.exports = main(context, parameters);
