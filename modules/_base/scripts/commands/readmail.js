/**
 * This command will read a message sent by another user
 * syntax :
 * readmail <number>
 *
 *
 *
 *
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
        const msg = await ctx.mail.readMessage(tag);
        if (msg) {
            await ctx.print('mail-read', {
                topic: msg.topic,
                body: msg.body,
                date: msg.date.toLocaleString(),
                sender: msg.sender.displayName,
            });
        } else {
            await ctx.print('mail.messageCannotBeAccessed');
        }
    } else {
        // first parameters needs to be a tag
        await ctx.print('mail.expectedTagParam');
    }
}

module.exports = main(context, parameters);
