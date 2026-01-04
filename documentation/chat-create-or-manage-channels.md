# Create or manage Chat channels

This document describe how to :

- add a new channel


## Adding a new channel

1. Go to `src/boot/channels.ts`
2. You may want to add a symbolic channel id : This id is used to reference the real chanel id in code.
3. You must add a new entry in channel definitions
```typescript
const newChannelDefinition = {
  id: CHANNEL_SYMBOLIC_ID.OOC,
  tag: '',
  persistent: true, // if true, channel will not be dropped when no user left
  readonly: false, // if true, no one can (by defaut) write on this channel, only specific users may.
  color: '#96c', // channel default color
  scoped: false, // if true, the channel has many instances of the same tag (clan, group, area...). user may only join one instance at the time.
  autojoin: true, // if true, users automaticaly join this channel
}
```
