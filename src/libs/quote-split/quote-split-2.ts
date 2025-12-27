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
    const args: string[] = [];
    let currentArg = '';
    let inDoubleQuote = false;
    let escapeNext = false;

    for (let i = 0, l = input.length; i < l; ++i) {
        const char = input.charAt(i);

        if (escapeNext) {
            currentArg += char;
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            if (escapeNext) {
                currentArg += char; // Ajoute le \ littéral
                escapeNext = false;
            } else {
                escapeNext = true;
            }
            continue;
        }

        if (char === '"') {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        if (WHITESPACE.has(char) && !inDoubleQuote) {
            if (currentArg.length > 0) {
                args.push(currentArg);
                currentArg = '';
            }
            continue;
        }

        currentArg += char;
    }

    if (currentArg.length > 0) {
        args.push(currentArg);
    }

    return {
        strings: args,
        inDoubleQuote,
        escapeNext,
    };
}
