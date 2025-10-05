import { fgcolor, getColorCode, evaluateColorCode, parseRGB } from './renderer';

describe('getColorCode()', () => {
    it('should return the correct color code', () => {
        expect(getColorCode(0, 0, 0)).toBe('0');
        expect(getColorCode(0, 0, 10)).toBe('016');
        expect(getColorCode(255, 0, 0)).toBe('196');
        expect(getColorCode(128, 0, 0)).toBe('124');
        expect(getColorCode(255, 255, 255)).toBe('15');
    });
});

describe('getAnsi16Code', () => {
    it('should return the correct ansi16 code', () => {
        expect(fgcolor('#000000')).toBe('\x1b[30m');
        expect(fgcolor('#AA0000')).toBe('\x1b[31m');
        expect(fgcolor('#00AA00')).toBe('\x1b[32m');
        expect(fgcolor('#AA5500')).toBe('\x1b[33m');
        expect(fgcolor('#0000AA')).toBe('\x1b[34m');
        expect(fgcolor('#AA00AA')).toBe('\x1b[35m');
        expect(fgcolor('#00AAAA')).toBe('\x1b[36m');
        expect(fgcolor('#AAAAAA')).toBe('\x1b[37m');
        expect(fgcolor('#555555')).toBe('\x1b[90m');
        expect(fgcolor('#FF5555')).toBe('\x1b[91m');
        expect(fgcolor('#55FF55')).toBe('\x1b[92m');
        expect(fgcolor('#FFFF55')).toBe('\x1b[93m');
        expect(fgcolor('#5555FF')).toBe('\x1b[94m');
        expect(fgcolor('#FF55FF')).toBe('\x1b[95m');
        expect(fgcolor('#55FFFF')).toBe('\x1b[96m');
        expect(fgcolor('#FFFFFF')).toBe('\x1b[97m');
        expect(fgcolor('#000')).toBe('\x1b[30m');
        expect(fgcolor('#A00')).toBe('\x1b[31m');
        expect(fgcolor('#0A0')).toBe('\x1b[32m');
        expect(fgcolor('#A50')).toBe('\x1b[33m');
        expect(fgcolor('#00A')).toBe('\x1b[34m');
        expect(fgcolor('#A0A')).toBe('\x1b[35m');
        expect(fgcolor('#0AA')).toBe('\x1b[36m');
        expect(fgcolor('#AAA')).toBe('\x1b[37m');
        expect(fgcolor('#555')).toBe('\x1b[90m');
        expect(fgcolor('#F55')).toBe('\x1b[91m');
        expect(fgcolor('#5F5')).toBe('\x1b[92m');
        expect(fgcolor('#FF5')).toBe('\x1b[93m');
        expect(fgcolor('#55F')).toBe('\x1b[94m');
        expect(fgcolor('#F5F')).toBe('\x1b[95m');
        expect(fgcolor('#5FF')).toBe('\x1b[96m');
        expect(fgcolor('#FFF')).toBe('\x1b[97m');
    });
});

describe('normalizeColorHexCode', () => {
    it('should return a numeric value of the corresponding color code', () => {
        expect(evaluateColorCode('#000')).toBe(0x000000);
        expect(evaluateColorCode('#FFF')).toBe(0xffffff);
        expect(evaluateColorCode('#fff')).toBe(0xffffff);
        expect(evaluateColorCode('#f8f8f8')).toBe(0xf8f8f8);
        expect(evaluateColorCode('white')).toBe(0xffffff);
        expect(evaluateColorCode('black')).toBe(0x000000);
        expect(evaluateColorCode('red')).toBe(0xff0000);
    });
});
