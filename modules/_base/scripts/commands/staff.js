// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHANNEL_DATA = require('../includes/channel-data.js');

/**
 * User should join staff channels if GAME_MASTER, ADMIN or MODERATOR.
 * Will send a message to the staff channel.
 * staff channel is for server staff only, not users.
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
function main(ctx, params) {
    const sText = params.join(' ').trim();
    if (sText !== '' && (ctx.user.isModerator() || ctx.user.isAdmin() || ctx.user.isGameMaster())) {
        ctx.chat.postMessage(CHANNEL_DATA.STAFF.channel, params.join(' ').trim());
    }
}

module.exports = main(context, parameters);
