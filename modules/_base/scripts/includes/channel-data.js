/**
 * This dict associates a symbolic identifier (usable in scripts) to a channel identifier
 */

module.exports = {
    TALK: {
        channel: 'public',
        command: 'pub',
    },
    NOOB: {
        channel: 'newbie',
        command: 'newbie',
    },
    OOC: {
        channel: 'ooc',
        command: 'ooc',
    },
    // Thematic
    TRADE: {
        channel: 'trade',
        command: '',
    },
    ROLEPLAY: {
        channel: 'rp',
        command: 'rp',
    },
    QUEST: {
        channel: 'quest',
        command: '',
    },
    RUMOR: {
        channel: 'rumor',
        command: '',
    },
    // Official
    INFO: {
        channel: 'info',
        command: 'broadcast',
    },
    STAFF: {
        channel: 'staff',
        command: 'staff',
    },
    TECH: {
        channel: 'tech',
        command: '',
    },
    // Clan/Group
    CLAN: {
        channel: 'clan',
        command: 'clan',
    },
    TEAM: {
        channel: 'team',
        command: 'gtell',
    },
};
