export type ChannelDefinition = {
    id: string; // channel id
    tag: string; // This could be a clan channel, or a localized channel
    persistent: boolean; // This channel will not be dropped when user count is reduced to zero
    readonly: boolean; // This channel is for announcements only
    scoped: boolean; // If true, this channel is scoped to a localization or a membership (clan, area, team...)
    color: string; // channel default color
    autojoin: boolean; // if true, all user will join this channel
    staff: boolean; // for user with some privilege (admin, gm, or modos)
};
