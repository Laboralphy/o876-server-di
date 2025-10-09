import { quoteSplit } from './index';

describe('quotesplit', () => {
    it('should return [alpha] when parsing : alpha', () => {
        expect(quoteSplit('alpha')).toEqual(['alpha']);
    });
    it('should return [alpha, beta] when parsing : alpha beta', () => {
        expect(quoteSplit('alpha beta')).toEqual(['alpha', 'beta']);
    });
    it('should return [alpha, beta, gamma] when parsing : alpha beta gamma', () => {
        expect(quoteSplit('alpha beta gamma')).toEqual(['alpha', 'beta', 'gamma']);
    });
    it('should trim all starting and trailing spaces', () => {
        expect(quoteSplit('   alpha beta gamma  ')).toEqual(['alpha', 'beta', 'gamma']);
    });
    it('should ignore double, triple and more separator spaces', () => {
        expect(quoteSplit('alpha    beta   gamma  ')).toEqual(['alpha', 'beta', 'gamma']);
    });
    it('should respect string inside quotes', () => {
        expect(quoteSplit('alpha    "beta   gamma"  ')).toEqual(['alpha', 'beta   gamma']);
        expect(quoteSplit('"alpha    beta"   gamma  ')).toEqual(['alpha    beta', 'gamma']);
        expect(quoteSplit('"alpha beta gamma"')).toEqual(['alpha beta gamma']);
    });
});
