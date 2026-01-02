const CHANNEL_DATA = require('./channel-data.js');
/**
 * This dict associates command -> channel
 * @type {{ask: string}}
 */
module.exports = {
    ask: CHANNEL_DATA.NOOB,
    answer: CHANNEL_DATA.NOOB,
    broadcast: CHANNEL_DATA.INFO,
};
