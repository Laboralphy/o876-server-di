import { serverConfig } from '../../libs/server-config';
import { IServerConfig } from '../../application/ports/services/IServerConfig';

export class ServerConfig implements IServerConfig {
    getConfigVariableString(name: string): string {
        const value = serverConfig()[name];
        if (value !== undefined) {
            return value.toString();
        } else {
            throw new Error(`Required config variable ${name}`);
        }
    }

    getConfigVariableNumber(name: string): number {
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
