// ANSI codes
export const ESC = '\x1b'; // Escape code
export const CSI = ESC + '['; // Control Sequence Introducer
export const OUT = ESC + ']'; // Control Sequence Finisher
export const FG8BIT = '38;5;'; // Change foreground color using 8 bits color code
export const BG8BIT = '48;5;'; // Change background color using 8 bits color code
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

export const ANSI_RESET = CSI + ST_RESET + 'm'; // Full reset code
export const ANSI_RESET_BG = CSI + '49m'; // Reset background only
export const ANSI_RESET_FG = CSI + '39m'; // Reset foreground only
export const ANSI_BOLD = CSI + ST_BOLD + 'm';
export const ANSI_DIM = CSI + ST_DIM + 'm';
export const ANSI_ITALIC = CSI + ST_ITALIC + 'm';
export const ANSI_UNDERLINE = CSI + ST_UNDERLINE + 'm';
export const ANSI_BLINK = CSI + ST_BLINK + 'm';
export const ANSI_INVERSE = CSI + ST_INVERSE + 'm';
export const ANSI_HIDDEN = CSI + ST_HIDDEN + 'm';
export const ANSI_STRIKE = CSI + ST_STRIKE + 'm';
export const ANSI_BOLD_OFF = CSI + ST_BOLD_OFF + 'm';
export const ANSI_DIM_OFF = CSI + ST_DIM_OFF + 'm';
export const ANSI_ITALIC_OFF = CSI + ST_ITALIC_OFF + 'm';
export const ANSI_UNDERLINE_OFF = CSI + ST_UNDERLINE_OFF + 'm';
export const ANSI_BLINK_OFF = CSI + ST_BLINK_OFF + 'm';
export const ANSI_INVERSE_OFF = CSI + ST_INVERSE_OFF + 'm';
export const ANSI_REVEAL = CSI + ST_REVEAL + 'm';
export const ANSI_STRIKE_OFF = CSI + ST_STRIKE_OFF + 'm';

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
        throw new RangeError('all rgb color components must be between 0 and 255');
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

/**
 * Convert a 3 hex digit string into an (r, g, b) structure
 * the input string may contain an initial # mark, as if it were a css color code
 * @param sColor
 */
export function parseRGB(sColor: string) {
    if (sColor.startsWith('#')) {
        sColor = sColor.substring(1);
    }
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
 * Returns true if given string is empty
 * @param color
 */
function isEmpty(color: string) {
    return color === '';
}

/**
 * Returns true if specified string is an ansi reset code (either foreground reset or background reset)
 * @param color
 */
function isRESET(color: string) {
    return color === ANSI_RESET || color === ANSI_RESET_FG || color === ANSI_RESET_BG;
}

/**
 * Convert hex color code into a complete ansi foreground color code
 * @param color
 */
function fg256(color: string) {
    return isEmpty(color) ? '' : isRESET(color) ? color : CSI + FG8BIT + color.toString() + 'm';
}

/**
 * Convert hex color code into a complete ansi background color code
 * @param color
 */
function bg256(color: string) {
    return isEmpty(color) ? '' : isRESET(color) ? color : CSI + BG8BIT + color.toString() + 'm';
}

/**
 * Produces fg and bg ansi color code
 * @param sFg if empty, foreground color code is not rendered
 * @param sBg if undefined, background color code is not rendered
 */
export function color(sFg: string, sBg?: string): string {
    if (sBg === undefined) {
        return fg256(getAnsi256Code(sFg));
    }
    if (sFg === '') {
        return bg256(getAnsi256Code(sBg));
    }
    return fg256(getAnsi256Code(sFg)) + bg256(getAnsi256Code(sBg));
}
