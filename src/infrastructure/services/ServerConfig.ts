import fs from 'node:fs';
import path from 'path';
import yaml from 'yaml';
import { ServerConfigOptionsSchema, ServerConfigOptions } from '../../domain/types/ServerConfig';
import { name, version, author, license, description } from '../../../package.json';
import { IServerConfig } from '../../application/ports/services/IServerConfig';

export class ServerConfig implements IServerConfig {
    private readonly config: ServerConfigOptions;
    private bConfigLoaded: boolean = false;

    constructor() {
        this.config = {
            name,
            version,
            author,
            license,
            description,
            loginNewUser: 'new',
            mailMaxExpirationDays: 30,
            mailMaxPinnedMessages: 20,
            mailMaxMessageLength: 1024,
            mailMaxTopicLength: 40,
            textEditorMaxCharacterCount: 2000,
            textEditorMaxLineCount: 25,
        };
    }

    getVariables(): ServerConfigOptions {
        if (this.bConfigLoaded) {
            return this.config;
        } else {
            const sConfigYaml = fs
                .readFileSync(path.join(__dirname, '../../../server-config.yaml'))
                .toString();
            Object.assign(
                this.config,
                ServerConfigOptionsSchema.parse({
                    ...yaml.parse(sConfigYaml),
                    name,
                    version,
                    author,
                    license,
                    description,
                })
            );
            this.bConfigLoaded = true;
            return this.config;
        }
    }
}
