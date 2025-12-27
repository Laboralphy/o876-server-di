/**
 * This command allows a client to disconnect from the server
 * @param ctx {IClientContext}
 */
function main(ctx) {
    ctx.closeConnection();
}

module.exports = main(context);
