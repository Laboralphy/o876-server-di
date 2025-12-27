/**
 * Display a list of commands
 * @param ctx {IClientContext}
 */
async function main(ctx) {
    const commandNames = ctx.commandNames;
    const commandInfo = commandNames.map((c) => {
        return {
            name: c,
            description: ctx.strref('help.' + c + '.shortdesc'),
        };
    });
    await ctx.print('help-command-list', { commands: commandInfo });
}

module.exports = main(context);
