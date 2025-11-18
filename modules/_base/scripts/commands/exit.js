/**
 * This command allows a client to disconnect from the server
 * @param ctx {IClientContext}
 */
function exit(ctx) {
    ctx.closeConnection();
}

exit(context);
