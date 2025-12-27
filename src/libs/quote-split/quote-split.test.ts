import { quoteSplit, quoteSplitEx } from './quote-split-2';

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

    it('should ignore double spaces, triple spaces, when considered as separators...', () => {
        expect(quoteSplit('alpha    beta   gamma  ')).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('should keep double sapces, triple spaces... when  inside quotes', () => {
        expect(quoteSplit('alpha    "beta   gamma"  ')).toEqual(['alpha', 'beta   gamma']);
        expect(quoteSplit('"alpha    beta"   gamma  ')).toEqual(['alpha    beta', 'gamma']);
        expect(quoteSplit('"alpha beta gamma"')).toEqual(['alpha beta gamma']);
    });

    it('should not convert LF into separators when outside quotes', () => {
        expect(quoteSplit('line 1\nline 2')).toEqual(['line', '1\nline', '2']);
    });

    it('should preserve LF inside quotes', () => {
        expect(quoteSplit('"line 1\nline 2"')).toEqual(['line 1\nline 2']);
    });

    it('should escape double quote properly', () => {
        expect('ooo\"ooo').toBe('ooo"ooo');
        const sDblQuote = '\"';
        const sEscape = '\\';
        const sEscDblQuote = '\\"';
        expect(sDblQuote).toHaveLength(1);
        expect(sEscape).toHaveLength(1);
        expect(sEscDblQuote).toHaveLength(2);
        expect(sEscDblQuote.charCodeAt(0)).toBe(92);
        expect(sEscDblQuote.charCodeAt(1)).toBe(34);
        // double quote is not a separator !
        expect(quoteSplit('"word 1"word 2')).toEqual(['word 1word', '2']);
    });

    it('should return ["\\"] when escaping \\ (using \\ on \\ )', async () => {
        expect(quoteSplit('\\\\')).toEqual(['\\']);
    });
});

describe('quoteSplitEx', () => {
    it('should return all flags to false when having not quote in input string', () => {
        expect(quoteSplitEx('alpha')).toEqual({
            strings: ['alpha'],
            inDoubleQuote: false,
            escapeNext: false,
        });
    });

    it('should return inDoubleQuotes to true when input string does not close double quotes', () => {
        expect(quoteSplitEx('alpha "beta')).toEqual({
            strings: ['alpha', 'beta'],
            inDoubleQuote: true,
            escapeNext: false,
        });
    });

    it('should return inDoubleQuotes to false when input string properly close double quotes', () => {
        expect(quoteSplitEx('alpha "beta"  ')).toEqual({
            strings: ['alpha', 'beta'],
            inDoubleQuote: false,
            escapeNext: false,
        });
    });

    it('should return inDoubleQuotes: true when input string is "alpha\\" (not really close double quote)', () => {
        expect(quoteSplitEx('"alpha\\"')).toEqual({
            strings: ['alpha"'],
            inDoubleQuote: true,
            escapeNext: false,
        });
    });

    it('should return inDoubleQuotes: false when input string is "alpha\\\\"', () => {
        expect(quoteSplitEx('"alpha\\\\"')).toEqual({
            strings: ['alpha\\'],
            inDoubleQuote: false,
            escapeNext: false,
        });
    });
});
