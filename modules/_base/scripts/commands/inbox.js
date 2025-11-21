/**
 * @var context {IClientContext}
 */
module.exports = async () => {
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
            kept: m.kept,
        },
    }));
};
