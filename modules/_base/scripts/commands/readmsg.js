/**
 * This command will read a message sent by another user
 * syntax :
 * readmail <number>
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
    const msg = await ctx.mail.readMessage();
    if (msg) {
        await ctx.print('mail-read', {
            body: msg.message,
            ts: msg.tsSent,
            sender: msg.sender.displayName,
            remaining: msg.remaining,
        });
    } else {
        await ctx.print('mail.inboxEmpty');
    }
}

module.exports = main(context);
