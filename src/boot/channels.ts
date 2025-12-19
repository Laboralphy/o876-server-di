import { ChannelDefinition } from '../infrastructure/services/ChatManager';

export enum CHANNEL_TAGS {
    CLAN = 'CLAN',
    TEAM = 'TEAM',
}

// general
// info
// answers
// rumors
// bugreports
// Team
// Guild
// Role play
// Rumors / Legend
// Bug suggestion
// Newbie

export const CHANNEL_DEFINITION: ChannelDefinition[] = [
    {
        id: 'global',
        tag: '',
        persistent: true,
        readonly: false,
        color: '#77b',
        scoped: false,
        autojoin: true,
    },
    {
        id: 'info',
        tag: '',
        persistent: true,
        readonly: true,
        color: '#7b7',
        scoped: false,
        autojoin: true,
    },
    {
        id: 'questions',
        tag: '',
        persistent: true,
        readonly: false,
        color: '#4e6',
        scoped: false,
        autojoin: true,
    },
    {
        id: 'rumors',
        tag: '',
        persistent: true,
        readonly: false,
        color: '#bb9',
        scoped: false,
        autojoin: true,
    },
    {
        id: 'bugreports',
        tag: '',
        persistent: true,
        readonly: false,
        color: '#f75',
        scoped: false,
        autojoin: true,
    },
    {
        id: 'team',
        tag: CHANNEL_TAGS.TEAM,
        persistent: false,
        readonly: false,
        color: '#28f',
        scoped: true,
        autojoin: false,
    },
    {
        id: 'clan',
        tag: CHANNEL_TAGS.CLAN,
        persistent: false,
        readonly: false,
        color: '#f8f',
        scoped: true,
        autojoin: false,
    },
];
