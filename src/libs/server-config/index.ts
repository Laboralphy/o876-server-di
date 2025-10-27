import fs from 'node:fs';
import path from 'path';
import yaml from 'yaml';

let bConfigLoaded: boolean = false;
let CONFIG: Record<string, number | string> = {};

export function serverConfig(): Record<string, number | string | undefined> {
    if (bConfigLoaded) {
        return CONFIG;
    } else {
        const sConfigYaml = fs
            .readFileSync(path.join(__dirname, '../../../server-config.yaml'))
            .toString();
        CONFIG = yaml.parse(sConfigYaml);
        bConfigLoaded = true;
        return CONFIG;
    }
}
