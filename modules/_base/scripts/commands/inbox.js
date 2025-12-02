/**
 * @var context {IClientContext}
 */
async function main(ctx) {
    /**
     * @type {CheckMailInboxEntry[]}
     */
    const mib = await context.mailCheckInbox();
    const mibResult = mib.map((m) => ({
        tag: m.tag,
        from: m.sender,
        date: m.date,
        topic: m.topic,
        flags: {
            read: m.read,
            important: false,
            pinned: m.pinned,
        },
    }));
    ctx.print('mail-inbox', mibResult);
}

module.exports = main(context);
