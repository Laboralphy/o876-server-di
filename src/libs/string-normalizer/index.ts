/**
 * Remove al diacritique from input string
 * @param s input string
 */
export function normalize(s: string) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
