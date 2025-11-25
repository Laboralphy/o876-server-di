import z from 'zod/index';

export const REGEX_USERNAME = /^[-_a-z0-9]{3,24}$/;
export const UserName = z.string().regex(REGEX_USERNAME);
