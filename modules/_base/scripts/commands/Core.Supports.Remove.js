/**
 * Client is setting what additional packages it no longer supports
 * @param ctx {IClientContext}
 * @param params {CoreSupportsSet}
 */
function main(ctx, params) {
    params.forEach((s) => {
        ctx.gmcp.removeSupportedPackage(s);
    });
}

main(context, parameters); // sync = no module.exports
