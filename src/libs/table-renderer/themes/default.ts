import { ITheme } from '../ITheme';

export const defaultTheme: ITheme = {
    SEPARATORS: {
        outer: {
            vertical: '|',
            horizontal: '-',
            nw: '+',
            ne: '+',
            sw: '+',
            se: '+',
            n: '+',
            e: '+',
            w: '+',
            s: '+',
        },
        inner: {
            vertical: '|',
            horizontal: '-',
            intersection: '+',
        },
    },
    BORDERS: {
        inner: true,
        rows: true,
        cols: true,
        top: true,
        bottom: true,
        left: true,
        right: true,
    },
};
