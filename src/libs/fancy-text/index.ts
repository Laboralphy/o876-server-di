import { normalize } from '../string-normalizer';
import { STYLES } from './styles';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWYYZ';
const FANCY_ORDER = ALPHABET + ALPHABET.toLowerCase();

/**
 * prints a single letter
 * @param s input char
 * @param nStyle font style
 */
function fancyLetter(s: string, nStyle: STYLES = 0) {
    const i = FANCY_ORDER.indexOf(s);
    return i >= 0 ? '\uD835' + String.fromCharCode(0xdc00 + i + 52 * nStyle) : s;
}

/**
 * prints a string of fancy font
 * @param s input string
 * @param nStyle font style
 */
export function fancyString(s: string, nStyle: STYLES = 0) {
    const sNormalized = normalize(s);
    const aOutput = [];
    for (let i = 0, l = sNormalized.length; i < l; ++i) {
        const sLetter = sNormalized.substring(i, i + 1);
        const sFancyLetter = fancyLetter(sLetter, nStyle);
        aOutput.push(sFancyLetter);
    }
    return aOutput.join('');
}
