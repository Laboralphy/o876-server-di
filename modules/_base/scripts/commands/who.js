/**
 * This commands builds a list of registered user, with additional information
 * such as : Roles, Online status
 */

/**
 * Returns a new user filtered list by string pattern
 * (provides a "search user by display name" functionality)
 * @param aList a list of users
 * @param sSearch the search pattern
 * @returns {User[]}
 */
function filterList(aList, sSearch) {
    if (sSearch === undefined) {
        return aList;
    }
    const matcher = new RegExp(sSearch, 'i');
    return aList.filter((u) => u.name.match(matcher));
}

/**
 *
 * @param ctx {IClientContext}
 * @param params {string[]}
 */
async function main(ctx, params) {
    const users = await ctx.user.getUsers();
    const userFoundList = filterList(
        users
            .map((user) => ({
                name: user.displayName,
                online: ctx.user.isConnected(user),
                admin: user.roles.includes('ADMIN'),
                moderator: user.roles.includes('MODERATOR'),
                gameMaster: user.roles.includes('GAME_MASTER'),
            }))
            .sort((a, b) => {
                if (a.online === b.online) {
                    return a.name.localeCompare(b.name);
                } else {
                    return a.online ? -1 : 1;
                }
            }),
        params[0]
    );
    await ctx.print('user-list', { users: userFoundList });
}

module.exports = main(context, parameters);
