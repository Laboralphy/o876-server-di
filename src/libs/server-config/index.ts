import fs from 'node:fs';
import path from 'path';
import yaml from 'yaml';
import { ServerConfigOptionsSchema, ServerConfigOptions } from '../../domain/types/ServerConfig';
import { name, version, author, license, description } from '../../../package.json';

let bConfigLoaded: boolean = false;
const CONFIG: ServerConfigOptions = {
    loginNewUser: 'new',
    mailMaxExpirationDays: 30,
    mailMaxPinnedMessages: 20,
    mailMaxMessageLength: 1024,
    mailMaxTopicLength: 40,
    name,
    version,
    author,
    license,
    description,
};

export function serverConfig(): ServerConfigOptions {
    if (bConfigLoaded) {
        return CONFIG;
    } else {
        const sConfigYaml = fs
            .readFileSync(path.join(__dirname, '../../../server-config.yaml'))
            .toString();
        Object.assign(
            CONFIG,
            ServerConfigOptionsSchema.parse({
                ...yaml.parse(sConfigYaml),
                name,
                version,
                author,
                license,
                description,
            })
        );
        bConfigLoaded = true;
        return CONFIG;
    }
}
