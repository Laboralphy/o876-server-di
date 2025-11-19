import { getMoonIllumination } from 'suncalc';

const MOON_UNICODE_GLYPHS = [
    '\uD83C\uDF11',
    '\uD83C\uDF12',
    '\uD83C\uDF13',
    '\uD83C\uDF14',
    '\uD83C\uDF15',
    '\uD83C\uDF16',
    '\uD83C\uDF17',
    '\uD83C\uDF18',
];

const MOON_PHASE_DATA = [
    { from: 0, to: 0.0625, index: 0, name: 'new' },
    { from: 0.0625, to: 0.1875, index: 1, name: 'waxingCrescent' },
    { from: 0.1875, to: 0.3125, index: 2, name: 'waxingQuarter' },
    { from: 0.3125, to: 0.4375, index: 3, name: 'waxingGibbous' },
    { from: 0.4375, to: 0.5625, index: 4, name: 'full' },
    { from: 0.5625, to: 0.6875, index: 5, name: 'waningGibbous' },
    { from: 0.6875, to: 0.8125, index: 6, name: 'lastQuarter' },
    { from: 0.8125, to: 0.9375, index: 7, name: 'waningCrescent' },
    { from: 0.9375, to: Infinity, index: 0, name: 'new' },
];

export function getMoonPhase(date: Date) {
    const mi = getMoonIllumination(date);
    for (let i = 0, l = MOON_PHASE_DATA.length; i < l; ++i) {
        if (mi.phase >= MOON_PHASE_DATA[i].from && mi.phase < MOON_PHASE_DATA[i].to) {
            return {
                age: (29.530587981 * mi.phase).toFixed(1),
                glyph: MOON_UNICODE_GLYPHS[MOON_PHASE_DATA[i].index],
                label: MOON_PHASE_DATA[i].name,
            };
        }
    }
    return {
        age: '0.0',
        glyph: MOON_UNICODE_GLYPHS[0],
        label: '-',
    };
}
