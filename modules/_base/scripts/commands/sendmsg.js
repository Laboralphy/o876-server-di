/**
 * This command sends a internal mail message to a
 */

/**
 * Mail messaging system
 * This command sends a message to another user, even if the recipient not online
 * @param ctx {IClientContext}
 * @param parameters {string[]}
 */
async function main(ctx, parameters) {
    const [recipientName, ...aMessageParts] = parameters;
    const sMessage = aMessageParts.join(' ').trim();
    if (sMessage.length === 0) {
        await ctx.print('mail.emptyMailNotSent');
        return;
    }
    const recipientUser = await ctx.user.find(recipientName);
    if (!recipientUser) {
        await ctx.print('mail.recipientNotFound');
        return;
    }
    await ctx.mail.sendMessage(recipientUser, sMessage);
    await ctx.print('mail.mailSent', { name: recipientUser.displayName });
}

module.exports = main(context, parameters);
