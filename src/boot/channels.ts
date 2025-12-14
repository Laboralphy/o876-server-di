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
        id: 'general',
        tag: '',
        readonly: false,
    },
    {
        id: 'info',
        tag: '',
        readonly: true,
    },
    {
        id: 'answer',
        tag: '',
        readonly: false,
    },
    {
        id: 'rumors',
        tag: '',
        readonly: false,
    },
    {
        id: 'bugreports',
        tag: '',
        readonly: false,
    },
    {
        id: 'team',
        tag: CHANNEL_TAGS.TEAM,
        readonly: false,
    },
    {
        id: 'clan',
        tag: CHANNEL_TAGS.CLAN,
        readonly: false,
    },
];
