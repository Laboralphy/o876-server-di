import fs from 'node:fs';
import path from 'path';
import yaml from 'yaml';
import { ServerConfigOptionsSchema, ServerConfigOptions } from '../../domain/types/ServerConfig';

let bConfigLoaded: boolean = false;
const CONFIG: ServerConfigOptions = {
    loginNewUser: 'new',
    mailMaxExpirationDays: 30,
    mailMaxKeptMessages: 20,
    mailMaxMessageLength: 1024,
    mailMaxTopicLength: 128,
    mailMaxMessagePreviewLength: 32,
};

export function serverConfig(): ServerConfigOptions {
    if (bConfigLoaded) {
        return CONFIG;
    } else {
        const sConfigYaml = fs
            .readFileSync(path.join(__dirname, '../../../server-config.yaml'))
            .toString();
        Object.assign(CONFIG, ServerConfigOptionsSchema.parse(yaml.parse(sConfigYaml)));
        bConfigLoaded = true;
        return CONFIG;
    }
}
