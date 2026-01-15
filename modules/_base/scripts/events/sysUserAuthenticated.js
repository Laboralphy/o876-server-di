/**
 * When a user is authenticated :
 * 1. displays mailbox
 * @param ctx {IClientContext}
 */
async function main(ctx) {
    await ctx.print('welcome.authenticated', { name: ctx.user.self.displayName });
    const aMessages = await ctx.mail.listMessages();
    const nMessageCount = aMessages.length;
    if (nMessageCount > 0) {
        await ctx.print('mail.unreadMessage', { count: nMessageCount });
    } else {
        await ctx.print('mail.inboxEmpty');
    }
}

module.exports = main(context);
