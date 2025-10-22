function quit(ctx) {
    console.log('closing connection');
    ctx.closeConnection();
}

/**
 * @var context {ExtensibleContext}
 */
quit(context);
