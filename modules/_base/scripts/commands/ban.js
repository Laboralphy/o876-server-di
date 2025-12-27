/**
 * Bans a user.
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
    if (params.length <= 3) {
        // this command requires at list one argument
        await ctx.print('error.badArgumentCount');
        return;
    }
    const [sUser, sDuration, ...aReason] = params;
    const sReason = aReason.join(' ');
    const oUserToBan = await ctx.user.find(sUser);
    if (!oUserToBan) {
        await ctx.print('error.userNotFound', { name: sUser });
        return;
    }
    const r = sDuration.match(/^(\d+)([hd])$/i);
    if (!r) {
        await ctx.print('error.badArgumentFormat', { n: 2 });
        return;
    }
    const unit = r[2].toLowerCase();
    const mult = unit === 'h' ? 3600 * 1000 : 24 * 3600 * 1000;
    const durRaw = parseInt(r[1]);
    const dur = parseInt(r[1]) * mult;
    await ctx.user.ban(oUserToBan, sReason, dur);
    /*
    We should add moderator to the announcement channel
    so the ban should be published to all users.
    moderator could broadcast :
    - user ban, user unban
    - simple conduct rules remind
     */
    ctx.chat.postMessage(
        'info',
        ctx.strref('userBanned.broadcast', {
            name: oUserToBan.displayName,
            count: durRaw,
            unit,
            reason: sReason,
            context: oUserToBan.female ? 'female' : 'male',
        })
    );
}

module.exports = main(context, parameters);
