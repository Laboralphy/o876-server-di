import { serverConfig } from '../../libs/server-config';
import { IServerConfig } from '../../application/ports/services/IServerConfig';
import { name, version, author, license, description } from '../../../package.json';

const BUILTINS = new Map([
    ['name', name],
    ['version', version],
    ['author', author],
    ['license', license],
    ['description', description],
]);

export class ServerConfig implements IServerConfig {
    getConfigVariableString(name: string): string {
        if (BUILTINS.has(name)) {
            return (BUILTINS.get(name) ?? '').toString();
        }
        const value = serverConfig()[name];
        if (value !== undefined) {
            return value.toString();
        } else {
            throw new Error(`Required config variable ${name}`);
        }
    }

    getConfigVariableNumber(name: string): number {
        if (BUILTINS.has(name)) {
            return parseFloat(BUILTINS.get(name) ?? '0');
        }
        const value = serverConfig()[name];
        if (typeof value === 'string') {
            return parseFloat(value);
        } else if (typeof value == 'number') {
            return value;
        } else {
            throw new Error(`Required config variable ${name}`);
        }
    }
}
