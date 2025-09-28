import { compactTheme } from './compact';
import { defaultTheme } from './default';
import { filetDoubleTheme } from './filet-double';
import { filetThinTheme } from './filet-thin';
import { filetThickTheme } from './filet-thick';
import { filetThinRoundedTheme } from './filet-thin-rounded';
import { filetThinnerTheme } from './filet-thinner';
import { ITheme } from '../ITheme';

export const THEMES: { [id: string]: ITheme } = {
    compact: compactTheme,
    default: defaultTheme,
    filetDouble: filetDoubleTheme,
    filetThin: filetThinTheme,
    filetThick: filetThickTheme,
    filetThinRounded: filetThinRoundedTheme,
    filetThinner: filetThinnerTheme,
};
