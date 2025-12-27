/**
 * This command will lead the client to enter interactive mode and change its password
 * @param ctx {IClientContext}
 */
function main(ctx) {
    return ctx.changePassword();
}

module.exports = main(context);
