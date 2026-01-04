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
        color: '#77b',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.OOC,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#96c',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.INFO,
        tag: '',
        persistent: true,
        readonly: true,
        color: '#ff0',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.NOOB,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#4e6',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.ROLEPLAY,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#bb9',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.TECH,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#f53',
        scoped: false,
        autojoin: true,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.STAFF,
        tag: '',
        persistent: true,
        readonly: false,
        color: '#f90',
        scoped: false,
        autojoin: true,
        staff: true,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.TEAM,
        tag: CHANNEL_TAGS.TEAM,
        persistent: false,
        readonly: false,
        color: '#28f',
        scoped: true,
        autojoin: false,
        staff: false,
    },
    {
        id: CHANNEL_SYMBOLIC_ID.CLAN,
        tag: CHANNEL_TAGS.CLAN,
        persistent: false,
        readonly: false,
        color: '#f8f',
        scoped: true,
        autojoin: false,
        staff: false,
    },
];
