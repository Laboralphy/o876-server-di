const WHITESPACE = new Set([' ', '\t']);

/**
 * This function splits a string into words, but preserves substring delimited by quotes
 * @example quoteSplit('abc def "ghi jkl" mno') -> ['abc', 'def', 'ghi jkl', 'mno']
 * @param input {string} input string
 * @return {string[]} output array
 */
export function quoteSplit(input: string): string[] {
    return quoteSplitEx(input).strings;
}

export type QuoteSplitResult = {
    strings: string[];
    inDoubleQuote: boolean;
    escapeNext: boolean;
};

export function quoteSplitEx(input: string): QuoteSplitResult {
    const tokens: string[] = [];
    let currentToken = '';
    let inDoubleQuote = false;
    let escapeNext = false;

    const flushToken = (): void => {
        if (currentToken.length > 0) {
            tokens.push(currentToken);
            currentToken = '';
        }
    };

    for (const ch of input) {
        if (escapeNext) {
            currentToken += ch;
            escapeNext = false;
            continue;
        }

        if (ch === '\\') {
            escapeNext = true;
            continue;
        }

        if (ch === '"') {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        if (WHITESPACE.has(ch) && !inDoubleQuote) {
            flushToken();
            continue;
        }

        currentToken += ch;
    }

    flushToken();

    return {
        strings: tokens,
        inDoubleQuote,
        escapeNext,
    };
}
