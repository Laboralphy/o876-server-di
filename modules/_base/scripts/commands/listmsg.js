/**
 * This command will list all unread messages
 * syntax :
 * listmsg
 *
 * @var context {IClientContext}
 * @var parameters {string[]}
 */

/**
 *
 * @param ctx {IClientContext}
 * @returns {Promise<void>}
 */
async function main(ctx) {
    const aMessages = await ctx.mail.listMessages();
    if (aMessages.length > 0) {
        await ctx.print('mail-list', {
            count: aMessages.length,
            messages: aMessages.map((message) => ({
                ts: message.tsSent,
                preview: message.preview,
                sender: message.sender.displayName,
            })),
        });
    } else {
        await ctx.print('mail.inboxEmpty');
    }
}

module.exports = main(context);
