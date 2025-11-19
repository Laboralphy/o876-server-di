// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../@types/client-context.d.ts" />
// /**
//  * pads zero at the beginning of the specified number
//  * this function is used for displaying numbers.
//  * @param n {number} input number
//  * @param size {number} final size of output string
//  * @returns {string} output string with starting padded zeros
//  */
function pad0(n, size) {
    return n.toString().padStart(size, '0');
}

/**
 * This command will display server time, with timezone indication, as well as some various astronomical
 * data like moon phase and moon age
 * @param ctx {IClientContext}
 */
async function time(ctx) {
    const st = ctx.getServerTime();
    const d = st.date;
    const timezone = st.timezone;
    const date = [pad0(d.getFullYear(), 4), pad0(d.getMonth() + 1, 2), pad0(d.getDate(), 2)].join(
        '-'
    );
    const time = [pad0(d.getHours(), 2), pad0(d.getMinutes(), 2), pad0(d.getSeconds(), 2)].join(
        ':'
    );
    await ctx.sendMessage('server-time', {
        time: time,
        date: date,
        timezone: timezone,
        moonphase: st.moon.glyph,
        moonage: st.moon.age,
        moonname: st.moon.label,
    });
}

/**
 * @var context {IClientContext}
 */
module.exports = time(context);
