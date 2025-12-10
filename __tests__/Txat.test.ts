import * as Txat from '../src/libs/txat';
import { POWERS } from '../src/libs/txat';

describe('Txat', () => {
    it('should create an instance without error', () => {
        expect(() => {
            const txat = new Txat.System();
        }).not.toThrow();
    });
});

describe('UserPresence', () => {
    it('should create a user presence without error', () => {
        expect(() => {
            const txat = new Txat.UserPresence('a1');
        }).not.toThrow();
    });
    describe('UserPresence grant hasPower', () => {
        const up = new Txat.UserPresence('a1');
        expect(up.hasPower(POWERS.READ)).toBe(false);
        up.grant(POWERS.READ);
        expect(up.hasPower(POWERS.READ)).toBe(true);
    });
    describe('UserPresence revoke hasPower', () => {
        const up = new Txat.UserPresence('a1');
        expect(up.hasPower(POWERS.READ)).toBe(false);
        up.grant(POWERS.READ);
        up.grant(POWERS.WRITE);
        expect(up.hasPower(POWERS.READ)).toBe(true);
        expect(up.hasPower(POWERS.WRITE)).toBe(true);
        up.revoke(POWERS.READ);
        expect(up.hasPower(POWERS.READ)).toBe(false);
        expect(up.hasPower(POWERS.WRITE)).toBe(true);
        up.revoke(POWERS.WRITE);
        expect(up.hasPower(POWERS.WRITE)).toBe(false);
        up.revoke(POWERS.WRITE);
        expect(up.hasPower(POWERS.WRITE)).toBe(false);
    });
});
