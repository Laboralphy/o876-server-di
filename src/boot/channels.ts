import { ChannelDefinition } from '../domain/types/ChannelDefinition';

export enum CHANNEL_TAGS {
    CLAN = 'CLAN',
    TEAM = 'TEAM',
}

/**
 * This is a list of channel symbolic ids
 */
export enum CHANNEL_SYMBOLIC_ID {
    // General channels
    TALK = 'public', // public channel, mostly in-character, discussion about game content, lightly immersive
    NOOB = 'newbie', // newbie channel, new players welcome here
    OOC = 'ooc', // out of character discussions, about real life or things not realted to game

    // Thematic
    TRADE = 'trade', // discussions about trading items
    ROLEPLAY = 'rp', // Role play discussions (always in-character)
    QUEST = 'quest', // discussion about how to resolve quests
    RUMOR = 'rumor', // discussion about rumors in game - Mostly in-character

    // Official
    INFO = 'info', // announcement channel, events, important messages...
    STAFF = 'staff', // staff private channels
    TECH = 'tech', // Technical discussion about the server, bug reports, always ooc

    // Clan/Group
    CLAN = 'clan',
    TEAM = 'team',
}

export const CHANNEL_DEFINITION: ChannelDefinition[] = [
    {
        id: CHANNEL_SYMBOLIC_ID.TALK,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#7777bb',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.OOC,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#9966cc',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.INFO,
        tag: '',
        persistent: true,
        readonly: true,
        color: '#ffff00',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.NOOB,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#44ee66',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.ROLEPLAY,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#bbbb99',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.TECH,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#ff5533',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.STAFF,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#ff9900',
        scoped: false,
        autojoin: true,
        staff: true,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.TEAM,
        tag: CHANNEL_TAGS.TEAM,
        persistent: false,
        readonly: false,
        color: '#2288ff',
        scoped: true,
        autojoin: false,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.CLAN,
        tag: CHANNEL_TAGS.CLAN,
        persistent: false,
        readonly: false,
        color: '#ff88ff',
        scoped: true,
        autojoin: false,
        staff: false,
    },
];

/**
 * Currently I'm putting the dict associating channel <-> command, here
 * I'm still thinking about a more suitable location by for the moment
 * it should be good here.
 * Let's see in the future if the channels/commands is often chenged
 */
export const CHANNEL_COMMANDS = new Map<string, string>([
    [CHANNEL_SYMBOLIC_ID.TALK, 'pub'],
    [CHANNEL_SYMBOLIC_ID.NOOB, 'newbie'],
    [CHANNEL_SYMBOLIC_ID.OOC, 'ooc'],
    [CHANNEL_SYMBOLIC_ID.ROLEPLAY, 'rp'],
    [CHANNEL_SYMBOLIC_ID.INFO, 'broadcast'],
    [CHANNEL_SYMBOLIC_ID.STAFF, 'staff'],
    [CHANNEL_SYMBOLIC_ID.TECH, 'tech'],
]);
