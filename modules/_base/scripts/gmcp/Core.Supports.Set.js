/**
 * Client is setting what packages it supports
 * @param ctx {IClientContext}
 * @param params {CoreSupportsSet}
 */
function main(ctx, params) {
    ctx.gmcp.clearSupportedPackages();
    params.forEach((s) => {
        ctx.gmcp.addSupportedPackage(s);
    });
}

main(context, parameters); // sync = no module.exports
