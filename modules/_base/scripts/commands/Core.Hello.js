/**
 * Client is notify client program name and version
 * @param ctx {IClientContext}
 * @param params {CoreHello}
 */
async function main(ctx, params) {
    ctx.gmcp.setClientProgram(params.client, params.version);
}

main(context, parameters);
