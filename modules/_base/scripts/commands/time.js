/**
 * This command will display server time, with timezone indication, as well as some various astronomical
 * data like moon phase and moon age
 * @param ctx {IClientContext}
 */
async function time(ctx) {
    const st = ctx.getServerTime();
    await ctx.print('server-time', {
        ts: st.now,
        timezone: st.timezone,
        moonphase: st.moon.glyph,
        moonage: st.moon.age,
        moonname: st.moon.label,
    });
}

/**
 * @var context {IClientContext}
 */
module.exports = time(context);
