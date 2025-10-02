import { getColorCode, parseRGB } from './renderer';

describe('getColorCode()', () => {
    it('should return the correct color code', () => {
        expect(getColorCode(0, 0, 0)).toBe('0');
        expect(getColorCode(0, 0, 10)).toBe('016');
        expect(getColorCode(255, 0, 0)).toBe('196');
        expect(getColorCode(128, 0, 0)).toBe('124');
        expect(getColorCode(255, 255, 255)).toBe('15');
    });
});
