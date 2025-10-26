/**
 * This command allows a client to disconnect from the server
 * @param ctx {IClientContext}
 */
function quit(ctx) {
    ctx.closeConnection();
}

quit(context);
