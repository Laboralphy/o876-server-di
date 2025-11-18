const MOON_AGE_PHASE = [
    '\uD83C\uDF11',
    '\uD83C\uDF12',
    '\uD83C\uDF13',
    '\uD83C\uDF14',
    '\uD83C\uDF15',
    '\uD83C\uDF16',
    '\uD83C\uDF17',
    '\uD83C\uDF18',
    '\uD83C\uDF11',
];

export function getMoonGlyph(age: number): string {
    const code = getMoonPhaseCode(age);
    return MOON_AGE_PHASE[code % MOON_AGE_PHASE.length];
}

export function getMoonPhaseCode(age: number): number {
    if (age < 1) {
        return 0;
    } else if (age < 3.7) {
        return 1;
    } else if (age < 7.4) {
        return 2;
    } else if (age < 11.1) {
        return 3;
    } else if (age < 14.8) {
        return 4;
    } else if (age < 18.5) {
        return 5;
    } else if (age < 22.2) {
        return 6;
    } else if (age < 25.9) {
        return 7;
    } else {
        return 0;
    }
}

export function computeMoonAge(year: number, month: number, day: number): number {
    // Calcul du nombre de jours juliens (JJ)
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const JJ =
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045;

    // Jour julien pour la nouvelle lune de référence (6 janvier 2000)
    const JJReference = 2451550.1;

    // Nombre de jours écoulés depuis la nouvelle lune de référence
    const joursEcoules = JJ - JJReference;

    // Âge de la lune en jours
    return ((joursEcoules % 29.530588853) + 29.530588853) % 29.530588853;
}

export function renderMoonPhase(year: number, month: number, day: number): string {
    const age = computeMoonAge(year, month, day);
    return getMoonGlyph(age);
}
