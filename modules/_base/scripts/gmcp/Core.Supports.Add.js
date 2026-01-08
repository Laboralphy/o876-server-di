/**
 * Client is setting what additional packages it supports
 * @param ctx {IClientContext}
 * @param params {CoreSupportsSet}
 */
function main(ctx, params) {
    params.forEach((s) => {
        ctx.gmcp.addSupportedPackage(s);
    });
}

main(context, parameters); // sync = no module.exports
