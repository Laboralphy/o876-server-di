/**
 * This test is for ensuring that all command of each module have all their help locales
 */
import fs from 'node:fs';
import path from 'node:path';

const MODULES: string[] = ['modules/_base'];

const COMMANDS: string[] = [];

beforeAll(() => {
    MODULES.map((m: string) => {
        const files = fs.readdirSync(path.resolve(m, 'scripts/commands')).map((s) => path.basename);
        COMMANDS.push(...files);
    });
});

describe('x', () => {
    it('should', () => {
        console.log(COMMANDS);
    });
});
