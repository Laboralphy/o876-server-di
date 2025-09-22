import * as dd from './index';

describe('renderDuration', function () {
    it('duration are exact', function () {
        expect(dd.renderDuration(1000)).toBe('1s');
        expect(dd.renderDuration(2000)).toBe('2s');
        expect(dd.renderDuration(3000)).toBe('3s');
        expect(dd.renderDuration(10000)).toBe('10s');
        expect(dd.renderDuration(10500)).toBe('10s');
        expect(dd.renderDuration(10999)).toBe('10s');
        expect(dd.renderDuration(11000)).toBe('11s');

        expect(dd.renderDuration(60 * 1000)).toBe('1min');
        expect(dd.renderDuration(65 * 1000)).toBe('1min 5s');
        expect(dd.renderDuration(119 * 1000)).toBe('1min 59s');
        expect(dd.renderDuration(120 * 1000)).toBe('2min');
        expect(dd.renderDuration(121 * 1000)).toBe('2min');
        expect(dd.renderDuration(180 * 1000)).toBe('3min');

        expect(dd.renderDuration(3600 * 1000 - 1)).toBe('59min');
        expect(dd.renderDuration(3600 * 1000)).toBe('1h');
        expect(dd.renderDuration(3600 * 1000 + 999)).toBe('1h');
        expect(dd.renderDuration(3601 * 1000)).toBe('1h');
        expect(dd.renderDuration(3660 * 1000)).toBe('1h 1min');
        expect(dd.renderDuration(3661 * 1000)).toBe('1h 1min');
        expect(dd.renderDuration(1.5 * 3600 * 1000)).toBe('1h 30min');

        expect(dd.renderDuration(23.5 * 3600 * 1000)).toBe('23h');
        expect(dd.renderDuration(24 * 3600 * 1000)).toBe('1d');
        expect(dd.renderDuration(24.5 * 3600 * 1000)).toBe('1d');
        expect(dd.renderDuration(24 * 3600 * 1000 + 1000)).toBe('1d');
        expect(dd.renderDuration(24 * 3600 * 1000 + 60000)).toBe('1d');
        expect(dd.renderDuration(24 * 3600 * 1000 + 3600000)).toBe('1d 1h');
        expect(dd.renderDuration(30 * 3600 * 1000)).toBe('1d 6h');
        expect(dd.renderDuration(36 * 3600 * 1000)).toBe('1d 12h');

        expect(dd.renderDuration(240 * 3600 * 1000)).toBe('10d');
        expect(dd.renderDuration(30 * 24 * 3600 * 1000)).toBe('30d');
        expect(dd.renderDuration(31 * 24 * 3600 * 1000)).toBe('1m');
        expect(dd.renderDuration(32 * 24 * 3600 * 1000)).toBe('1m 1d');
        expect(dd.renderDuration(60 * 24 * 3600 * 1000)).toBe('1m 29d');
        expect(dd.renderDuration(61 * 24 * 3600 * 1000)).toBe('2m');
        expect(dd.renderDuration(62 * 24 * 3600 * 1000)).toBe('2m');
        expect(dd.renderDuration(365 * 24 * 3600 * 1000)).toBe('11m');
        expect(dd.renderDuration(365.25 * 24 * 3600 * 1000)).toBe('1y');
        expect(dd.renderDuration(395 * 24 * 3600 * 1000)).toBe('1y');
        expect(dd.renderDuration(396 * 24 * 3600 * 1000)).toBe('1y 1m');
        expect(dd.renderDuration(730 * 24 * 3600 * 1000)).toBe('1y 11m');
        expect(dd.renderDuration(365.2422 * 1.9999 * 24 * 3600 * 1000)).toBe('1y 11m');
        expect(dd.renderDuration(365.2422 * 2 * 24 * 3600 * 1000)).toBe('2y');
        expect(dd.renderDuration(365.2422 * 3 * 24 * 3600 * 1000)).toBe('3y');
        expect(dd.renderDuration(365.2422 * 10 * 24 * 3600 * 1000)).toBe('10y');

        expect(dd.renderDuration(365.2422 * 10 * 24 * 3600 * 1000, { years: 'a' })).toBe('10a');

        expect(dd.renderDuration(0)).toBe('now');
        expect(dd.renderDuration(0, { now: 'maintenant' })).toBe('maintenant');
    });

    describe('render', function () {
        expect(dd.render(new Date(), 'dur')).toBe('now');
    });

    describe('custom duration render', function () {
        const options = {
            year: 'an',
            years: 'ans',
            month: 'mois',
            months: 'mois',
            day: 'jour',
            days: 'jours',
            hour: 'heure',
            hours: 'heures',
            minute: 'minute',
            minutes: 'minutes',
            seconde: 'seconde',
            secondes: 'secondes',
            space: ' ',
        };
        expect(dd.renderDuration(123456789, options)).toBe('1 jour 10 heures');
    });
});
