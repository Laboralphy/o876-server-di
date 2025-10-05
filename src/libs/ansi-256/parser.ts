import * as c from './renderer';
import { ANSI_REVERSED_CODES } from './ansi-reverse-codes';

/**
 * An ansi token of type ANSI : the value part will be an ANSI color/style code
 * An ansi token of type TEXT : the value part will be a regular text string
 */
enum TokenType {
    TEXT,
    ANSI,
}

/**
 * Contain either an ansi style/color code or a simple string
 */
interface AnsiToken {
    type: TokenType;
    value: string;
}

/**
 * Result of an ansi code parsing
 * attrs is a string, each character represent an active styles
 * available styles are :
 *     - b: bold
 *     - d: dim
 *     - i: italic
 *     - u: underline
 *     - s: strike
 *     - h: hidden
 */
type ParseAnsiStyleResult = {
    fg: string;
    bg: string;
    attrs: string;
};

/**
 * This type is just a an ansi style structure with a text
 * It should represent a string of character with the specified fg and bg colors and the attrs styles
 */
type StyleStructure = ParseAnsiStyleResult & { text: string };

const R_STYLE_SPLIT = /(\u001b\[[;m0-9]+)/g;
const R_STYLE_COMP = /(\d+)[;m]/g;

/**
 * split a string into an array of AnsiToken
 * @param input
 */
export function tokenizeAnsi(input: string): AnsiToken[] {
    const ansiRegex = /\x1b\[[0-9;]*m/g;
    const tokens: AnsiToken[] = [];
    let lastIndex = 0;
    let match;

    while ((match = ansiRegex.exec(input)) !== null) {
        // Ajouter le texte avant le code ANSI
        if (match.index > lastIndex) {
            tokens.push({
                type: TokenType.TEXT,
                value: input.substring(lastIndex, match.index),
            });
        }
        // Ajouter le code ANSI
        tokens.push({
            type: TokenType.ANSI,
            value: match[0],
        });
        lastIndex = ansiRegex.lastIndex;
    }

    // Ajouter le texte restant après le dernier code ANSI
    if (lastIndex < input.length) {
        tokens.push({
            type: TokenType.TEXT,
            value: input.substring(lastIndex),
        });
    }

    return tokens;
}

/**
 * Analyzes an ansi style.
 * extract foreground color, background color, and a set of styling attributes
 * @param sStyle
 */
export function parseAnsiStyle(sStyle: string): ParseAnsiStyleResult {
    const aParsed = sStyle.match(R_STYLE_SPLIT);
    let fg = '';
    let bg = '';
    let attrs: string[] = [];
    if (aParsed) {
        aParsed.forEach((p) => {
            const pm = p.match(R_STYLE_COMP);
            if (pm) {
                const pm2 = pm.map((x) => parseInt(x));
                const prev = [0, 0, 0];
                for (const n of pm2) {
                    const [n2, n1] = prev.slice(-2);
                    if (n1 === 5) {
                        // Cas des couleurs 256 bits
                        switch (n2) {
                            case 38: {
                                fg = n.toString();
                                break;
                            }
                            case 39: {
                                fg = '';
                                break;
                            }
                            case 48: {
                                bg = n.toString();
                                break;
                            }
                            case 49: {
                                bg = '';
                                break;
                            }
                            default: {
                                break; // ignore this color code
                            }
                        }
                    } else {
                        switch (n) {
                            case 0: {
                                // reset
                                fg = '';
                                bg = '';
                                attrs = [];
                                break;
                            }
                            case c.ST_BOLD: {
                                // bold
                                attrs.push('b');
                                break;
                            }
                            case c.ST_DIM: {
                                // bold
                                attrs.push('d');
                                break;
                            }
                            case c.ST_ITALIC: {
                                // italic
                                attrs.push('i');
                                break;
                            }
                            case c.ST_UNDERLINE: {
                                // underline
                                attrs.push('u');
                                break;
                            }
                            case c.ST_STRIKE: {
                                // strike
                                attrs.push('s');
                                break;
                            }
                            case c.ST_HIDDEN: {
                                // strike
                                attrs.push('h');
                                break;
                            }
                            case 30:
                            case 31:
                            case 32:
                            case 33:
                            case 34:
                            case 35:
                            case 36:
                            case 37: {
                                // fg color
                                fg = (n - 30).toString();
                                break;
                            }
                            case 40:
                            case 41:
                            case 42:
                            case 43:
                            case 44:
                            case 45:
                            case 46:
                            case 47: {
                                // bg color
                                bg = (n - 40).toString();
                                break;
                            }

                            default: {
                                break; // ignore this style code
                            }
                        }
                    }
                    prev.push(n);
                }
            }
        });
    }
    return {
        fg,
        bg,
        attrs: attrs.sort((a, b) => a.localeCompare(b)).join(''),
    };
}

/**
 * Convert an ansi string in a structure that indicates what style is each parts of the text
 * Each part is a StyleStructure with these properties :
 * - fg : if non-empty, indicates foreground color (css)
 * - bg : if non-empty, indicates background color (css)
 * - attrs: a string of styles, each character indicates an active style
 *     - b: bold
 *     - d: dim
 *     - i: italic
 *     - u: underline
 *     - s: strike
 *     - h: hidden
 * @param sAnsiString
 */
export function parse(sAnsiString: string) {
    const a = tokenizeAnsi(sAnsiString);
    const output: StyleStructure[] = [];
    [] = [];
    let sLastStyle = '';
    let sContent = '';
    const commitStyle = (style: string) => {
        const { fg, bg, attrs } = parseAnsiStyle(sLastStyle);
        const fghex = fg ? ANSI_REVERSED_CODES[parseInt(fg)] : '';
        const bghex = bg ? ANSI_REVERSED_CODES[parseInt(bg)] : '';
        output.push({ fg: fghex, bg: bghex, text: sContent, attrs });
        sLastStyle = style;
        sContent = '';
    };
    a.forEach(({ type, value }) => {
        switch (type) {
            case TokenType.ANSI: {
                if (value !== sLastStyle) {
                    commitStyle(value);
                }
                break;
            }
            case TokenType.TEXT: {
                sContent += value;
                break;
            }
            default: {
                break;
            }
        }
    });
    commitStyle('');
    return output;
}
