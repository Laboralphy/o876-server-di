/**
 * This commands builds a list of registered user, with additional information
 * such as : Roles, Online status
 *
 * @var context {IClientContext}
 * @var parameters {string[]}
 */

/**
 * Returns a new user filtered list by string pattern
 * (provides a "search user by display name" functionality)
 * @param aList {User[]} a list of users
 * @param sSearch {string} the search pattern
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
            .filter((user) => ctx.user.isConnected(user))
            .map((user) => ({
                name: user.displayName,
                admin: user.roles.includes('ADMIN'),
                moderator: user.roles.includes('MODERATOR'),
                gameMaster: user.roles.includes('GAME_MASTER'),
            }))
            .slice(0, 25)
            .sort((a, b) => {
                const na = (a.admin ? 4 : 0) + (a.moderator ? 2 : 0) + (a.gameMaster ? 1 : 0);
                const nb = (b.admin ? 4 : 0) + (b.moderator ? 2 : 0) + (b.gameMaster ? 1 : 0);
                if (na === nb) {
                    return a.name.localeCompare(b.name);
                } else {
                    return nb - na;
                }
            }),
        params[0]
    );
    await ctx.print('user-list', { users: userFoundList, more: users > 25 });
}

module.exports = main(context, parameters);
