const ESC = '\x1b';
const ANSI_COLOR_FG = '[38;5;';
const COLOR_ORANGE = ESC + ANSI_COLOR_FG + '208m';
const COLOR_GREEN = ESC + ANSI_COLOR_FG + '46m';

/**
 * Will send a public message (visible by all) to the "questions" channel
 * The "ask" command will print an orange colored message on the "questions" channel
 * This channel is useful for new players for asking questions and for veteran players for answering questions
 *
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    ctx.chat.postMessage('questions', COLOR_ORANGE + params.join(' '));
}

main(context, parameters);
