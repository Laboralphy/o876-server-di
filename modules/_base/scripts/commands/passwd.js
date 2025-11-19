/**
 * This command will leads the client to enter interactive mode and change its password
 * @param ctx {IClientContext}
 */
function exit(ctx) {
    return ctx.changePassword();
}

module.exports = exit(context);
