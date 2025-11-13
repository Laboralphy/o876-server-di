// ANSI codes
import { COLOR_CODES } from './color-codes';

export const ESC = '\x1b'; // Escape code
export const CSI = ESC + '['; // Control Sequence Introducer
export const OUT = ESC + ']'; // Control Sequence Finisher

export const ST_RESET = 0; // Resets all codes, back to default style
export const ST_BOLD = 1; // Set font to bold
export const ST_DIM = 2; // Set font to dim (lower brightness)
export const ST_ITALIC = 3; // Set style to italic
export const ST_UNDERLINE = 4; // Add underline decoration
export const ST_BLINK = 5; // Make font blink (not used)
export const ST_INVERSE = 7; // Inverse background and foreground
export const ST_HIDDEN = 8; // Don't display
export const ST_STRIKE = 9; // Add a strike decoration
export const ST_BOLD_OFF = 21; // Turns bold off
export const ST_DIM_OFF = 22; // Back to normal intensity
export const ST_ITALIC_OFF = 23; // Turns italic styling off
export const ST_UNDERLINE_OFF = 24; // remove underline decoration
export const ST_BLINK_OFF = 25; // Remove blink
export const ST_INVERSE_OFF = 27; // Turn inverse off
export const ST_REVEAL = 28; // Turn hidden off
export const ST_STRIKE_OFF = 29; // Remove strike decoration

export const FG8BIT = '38;5;';
export const BG8BIT = '48;5;';

export const ANSI_TERM_CHAR = 'm';
export const ANSI_RESET = CSI + ST_RESET + ANSI_TERM_CHAR; // Full reset code
export const ANSI_FG8BIT = CSI + FG8BIT; // Change foreground color using 8 bits color code
export const ANSI_BG8BIT = CSI + BG8BIT; // Change background color using 8 bits color code
export const ANSI_RESET_BG = CSI + '49' + ANSI_TERM_CHAR; // Reset background only
export const ANSI_RESET_FG = CSI + '39' + ANSI_TERM_CHAR; // Reset foreground only

export const ANSI_BOLD = CSI + ST_BOLD + ANSI_TERM_CHAR;
export const ANSI_DIM = CSI + ST_DIM + ANSI_TERM_CHAR;
export const ANSI_ITALIC = CSI + ST_ITALIC + ANSI_TERM_CHAR;
export const ANSI_UNDERLINE = CSI + ST_UNDERLINE + ANSI_TERM_CHAR;
export const ANSI_BLINK = CSI + ST_BLINK + ANSI_TERM_CHAR;
export const ANSI_INVERSE = CSI + ST_INVERSE + ANSI_TERM_CHAR;
export const ANSI_HIDDEN = CSI + ST_HIDDEN + ANSI_TERM_CHAR;
export const ANSI_STRIKE = CSI + ST_STRIKE + ANSI_TERM_CHAR;
export const ANSI_BOLD_OFF = CSI + ST_BOLD_OFF + ANSI_TERM_CHAR;
export const ANSI_DIM_OFF = CSI + ST_DIM_OFF + ANSI_TERM_CHAR;
export const ANSI_ITALIC_OFF = CSI + ST_ITALIC_OFF + ANSI_TERM_CHAR;
export const ANSI_UNDERLINE_OFF = CSI + ST_UNDERLINE_OFF + ANSI_TERM_CHAR;
export const ANSI_BLINK_OFF = CSI + ST_BLINK_OFF + ANSI_TERM_CHAR;
export const ANSI_INVERSE_OFF = CSI + ST_INVERSE_OFF + ANSI_TERM_CHAR;
export const ANSI_REVEAL = CSI + ST_REVEAL + ANSI_TERM_CHAR;
export const ANSI_STRIKE_OFF = CSI + ST_STRIKE_OFF + ANSI_TERM_CHAR;

const ANSI_16_COLOR_MAP: Readonly<Map<string, number>> = new Map([
    ['#000000', 0],
    ['#aa0000', 1],
    ['#00aa00', 2],
    ['#aa5500', 3],
    ['#0000aa', 4],
    ['#aa00aa', 5],
    ['#00aaaa', 6],
    ['#aaaaaa', 7],
    ['#555555', 60],
    ['#ff5555', 61],
    ['#55ff55', 62],
    ['#ffff55', 63],
    ['#5555ff', 64],
    ['#ff55ff', 65],
    ['#55ffff', 66],
    ['#ffffff', 67],
    ['#000', 0],
    ['#a00', 1],
    ['#0a0', 2],
    ['#a50', 3],
    ['#00a', 4],
    ['#a0a', 5],
    ['#0aa', 6],
    ['#aaa', 7],
    ['#555', 60],
    ['#f55', 61],
    ['#5f5', 62],
    ['#ff5', 63],
    ['#55f', 64],
    ['#f5f', 65],
    ['#5ff', 66],
    ['#fff', 67],
]);
/**
 * Converts a color into an ansi color code string
 * The function returns a numeric string, to be embedded in a ansi string
 * The output string does not contain ESC character and other ansi special symbols
 * @param r red component of color (0-255)
 * @param g green component of color (0-255)
 * @param b blue component of color (0-255)
 */
export function getColorCode(r: number, g: number, b: number): string {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        throw new RangeError('All rgb color components must be between 0 and 255');
    }
    if (r === g && r === b) {
        // grayscale
        const gs = Math.round(25 * (r / 255));
        if (gs === 0) {
            return '0';
        }
        if (gs === 25) {
            return '15';
        }
        return (gs - 1 + 232).toString();
    }
    const r6 = Math.round((5 * r) / 255);
    const g6 = Math.round((5 * g) / 255);
    const b6 = Math.round((5 * b) / 255);
    return (r6 * 36 + g6 * 6 + b6 + 16).toString().padStart(3, '0');
}

const REGEX_CSS_COLOR = /^#[0-9a-z]{3,6}$/i;

/**
 * Transform a color code to a numeric value RGB-888
 * @param sColor input color, can be a css code (starting with #) or a standard html color label (red, blue...)
 */
export function evaluateColorCode(sColor: string): number {
    if (sColor.match(REGEX_CSS_COLOR)) {
        const sHexColor = sColor.substring(1).toLowerCase();
        if (sHexColor.length === 3) {
            return parseInt(
                '0x' +
                    sHexColor.charAt(0) +
                    sHexColor.charAt(0) +
                    sHexColor.charAt(1) +
                    sHexColor.charAt(1) +
                    sHexColor.charAt(2) +
                    sHexColor.charAt(2)
            );
        } else if (sHexColor.length === 6) {
            return parseInt('0x' + sHexColor);
        } else {
            return NaN;
        }
    }
    const sColorValue = COLOR_CODES[sColor.toLowerCase()];
    if (sColorValue) {
        return parseInt('0x' + sColorValue.substring(1));
    } else {
        throw new Error(`Invalid color code : ${sColor}`);
    }
}

export function parseColorCode(sColor: string): string {
    if (sColor.startsWith('#')) {
        return sColor;
    } else {
        const c = COLOR_CODES[sColor.toLowerCase()];
        if (c === undefined) {
            return '#777777';
        } else {
            return c;
        }
    }
}

/**
 * Convert a 3 hex digit string into an (r, g, b) structure
 * the input string may contain an initial # mark, as if it were a css color code
 * @param sColor
 */
export function parseRGB(sColor: string) {
    if (!sColor.startsWith('#')) {
        sColor = COLOR_CODES[sColor.toLowerCase()];
    }
    sColor = sColor.substring(1);
    if (sColor.length === 3) {
        sColor =
            sColor.charAt(0) +
            sColor.charAt(0) +
            sColor.charAt(1) +
            sColor.charAt(1) +
            sColor.charAt(2) +
            sColor.charAt(2);
    }
    const nColor = parseInt('0x' + sColor);
    const r = (nColor >> 16) & 0xff;
    const g = (nColor >> 8) & 0xff;
    const b = nColor & 0xff;
    return { r, g, b };
}

/**
 * Return an ansi code
 * @param sColor
 * @param background
 */
function getAnsi16Code(sColor: string, background: boolean = false): number | undefined {
    if (!sColor.startsWith('#')) {
        sColor = COLOR_CODES[sColor.toLowerCase()];
    }
    const c = ANSI_16_COLOR_MAP.get(sColor.toLowerCase());
    return c === undefined ? undefined : c + 30 + (background ? 60 : 0);
}

/**
 * Convert a color code into an ansi color code
 * @param sColor
 */
function getAnsi256Code(sColor: string): string {
    const bStartsZero = sColor.startsWith('0');
    const ac = parseInt(sColor);
    if (bStartsZero || isNaN(ac)) {
        const { r, g, b } = parseRGB(sColor);
        return getColorCode(r, g, b);
    } else {
        return ac.toString();
    }
}

/**
 * Convert hex color code into a complete ansi foreground color code
 * @param color
 */
function fg256(color: string) {
    return color == '' ? ANSI_RESET_FG : CSI + FG8BIT + color.toString() + ANSI_TERM_CHAR;
}

/**
 * Convert hex color code into a complete ansi background color code
 * @param color
 */
function bg256(color: string) {
    return color == '' ? ANSI_RESET_BG : CSI + BG8BIT + color.toString() + ANSI_TERM_CHAR;
}

/**
 * Produces foreground ansi color code
 * @param sColor a CSS color (3 or 6 hex digit, optionally starting with #)
 */
export function fgcolor(sColor: string): string {
    const color16 = getAnsi16Code(sColor);
    if (color16 !== undefined) {
        return CSI + color16.toString() + ANSI_TERM_CHAR;
    } else {
        return fg256(getAnsi256Code(sColor));
    }
}

/**
 * Produces foreground ansi color code
 * @param sColor a CSS color (3 or 6 hex digit, optionally starting with #)
 */
export function bgcolor(sColor: string): string {
    const color16 = getAnsi16Code(sColor, true);
    if (color16 !== undefined) {
        return CSI + color16.toString() + ANSI_TERM_CHAR;
    } else {
        return bg256(getAnsi256Code(sColor));
    }
}
