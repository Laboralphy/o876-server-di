/**
 * Displays command help file
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    const command = params[0];
    const descriptionRef = 'help.' + command + '.description';
    const syntaxRef = 'help.' + command + '.syntax';
    const cmdParameters = ctx.strref('help.' + command + '.parameters', { returnObjects: true });
    ctx.print('help-command', {
        command,
        descriptionRef,
        syntaxRef,
        cmdParameters,
    });
}

module.exports = main(context, parameters);
