/**
 * Tests to ensure that all modules/_base/locales strings are coherent
 */

import * as moduleBaseLocalesENGeneral from '../modules/_base/locales/en/general.json';
import * as moduleBaseLocalesFRGeneral from '../modules/_base/locales/fr/general.json';
import * as moduleBaseLocalesENErrors from '../modules/_base/locales/en/errors.json';
import * as moduleBaseLocalesFRErrors from '../modules/_base/locales/fr/errors.json';
import * as moduleBaseLocalesENHelp from '../modules/_base/locales/en/help.json';
import * as moduleBaseLocalesFRHelp from '../modules/_base/locales/fr/help.json';

function extractJsonKeys(obj: any, prefix: string = '', result: string[] = []): string[] {
    if (Array.isArray(obj)) {
        for (let i = 0, l = obj.length; i < l; i++) {
            const newKey = prefix !== '' ? `${prefix}.${i}` : i.toString();
            result.push(newKey);
            extractJsonKeys(obj[i], newKey, result);
        }
    } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix !== '' ? `${prefix}.${key}` : key;
            result.push(newKey);
            extractJsonKeys(value, newKey, result);
        }
    }
    return result;
}

function sortAndProcess(a: string[]): string[] {
    return a.filter((x) => !x.endsWith('_female')).sort((x, y) => x.localeCompare(y));
}

/**
 * This test is for ensuring that all command of each module have all their help locales
 */
import fs from 'node:fs';
import path from 'node:path';

describe('extractJsonKeys', () => {
    it('should return [alpha] where extracting json keys of {alpha: 1}', () => {
        expect(extractJsonKeys({ alpha: 1 })).toEqual(['alpha']);
    });
    it('should return [alpha, beta] where extracting json keys of {alpha: 1, beta: 2}', () => {
        expect(extractJsonKeys({ alpha: 1, beta: 2 })).toEqual(['alpha', 'beta']);
    });
    it('should return [alpha, beta, beta.delta] where extracting json keys of {alpha: 1, beta: {delta: 3 }}', () => {
        expect(extractJsonKeys({ alpha: 1, beta: { delta: 3 } })).toEqual([
            'alpha',
            'beta',
            'beta.delta',
        ]);
    });
    it('should return [alpha, beta, beta.delta, beta.delta.0, beta.delta.1, beta.delta.2] where extracting json keys of {alpha: 1, beta: {delta: [10, 20, 30] }}', () => {
        expect(extractJsonKeys({ alpha: 1, beta: { delta: [10, 20, 30] } })).toEqual([
            'alpha',
            'beta',
            'beta.delta',
            'beta.delta.0',
            'beta.delta.1',
            'beta.delta.2',
        ]);
    });
    it('should return [alpha, beta, beta.delta, beta.delta.0, beta.delta.1, beta.delta.1.epsilon, beta.delta.1.lambda, beta.delta.2] where extracting json keys of {alpha: 1, beta: {delta: [10, { epsilon: 200, lambda: null }, 30] }}', () => {
        expect(
            extractJsonKeys({ alpha: 1, beta: { delta: [10, { epsilon: 200, lambda: null }, 30] } })
        ).toEqual([
            'alpha',
            'beta',
            'beta.delta',
            'beta.delta.0',
            'beta.delta.1',
            'beta.delta.1.epsilon',
            'beta.delta.1.lambda',
            'beta.delta.2',
        ]);
    });
});

describe('moduleBaseLocalesXXGeneral', () => {
    it('all general locales structure should have the same keys', () => {
        const frKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesFRGeneral));
        const enKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesENGeneral));
        expect(enKeys).toEqual(frKeys);
    });
});

describe('moduleBaseLocalesXXErrors', () => {
    it('all errors locales structure should have the same keys', () => {
        const frKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesFRErrors));
        const enKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesENErrors));
        expect(enKeys).toEqual(frKeys);
    });
});

describe('moduleBaseLocalesXXHelp', () => {
    it('all help locales structure should have the same keys', () => {
        const frKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesFRHelp));
        const enKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesENHelp));
        expect(enKeys).toEqual(frKeys);
    });
});

describe('Help commands', () => {
    const MODULES: string[] = ['modules/_base'];
    const COMMANDS: string[] = [];

    beforeAll(() => {
        MODULES.map((m: string) => {
            const files = fs
                .readdirSync(path.resolve(m, 'scripts/commands'))
                .map((s) => path.basename(s, '.js'));
            COMMANDS.push(...files);
        });
    });

    it('all commands should have its help locale', () => {
        const frKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesFRHelp.help));
        const enKeys = sortAndProcess(extractJsonKeys(moduleBaseLocalesENHelp.help));
        for (const cmd of COMMANDS) {
            expect(enKeys).toContain(cmd + '.shortdesc');
            expect(enKeys).toContain(cmd + '.description');
            expect(enKeys).toContain(cmd + '.syntax');
            expect(enKeys).toContain(cmd + '.parameters');
            expect(frKeys).toContain(cmd + '.shortdesc');
            expect(frKeys).toContain(cmd + '.description');
            expect(frKeys).toContain(cmd + '.syntax');
            expect(frKeys).toContain(cmd + '.parameters');
        }
    });
});
