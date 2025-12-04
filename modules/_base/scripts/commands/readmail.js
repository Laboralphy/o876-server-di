/**
 * @var context {IClientContext}
 */
async function main(ctx, params) {
    const tag = parseInt(params[0]);
    if (!isNaN(tag)) {
        const msg = await ctx.mail.readMessage(tag);
        ctx.print('mail-read', {
            topic: msg.topic,
            body: msg.body,
            date: msg.date.toLocaleString(),
            sender: msg.sender.displayName,
        });
    } else {
        // first parameters needs to be a tag
        ctx.print('mail.readMessageWrongParam');
    }
}

module.exports = main(context, parameters);
