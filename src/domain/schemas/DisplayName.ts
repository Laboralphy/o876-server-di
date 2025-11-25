import z from 'zod';

export const REGEX_DISPLAYNAME = /^[a-zA-Z](?:[a-zA-Z-]{1,22}[a-zA-Z])?$/;
export const DisplayName = z.string().regex(REGEX_DISPLAYNAME).max(24).min(3);
