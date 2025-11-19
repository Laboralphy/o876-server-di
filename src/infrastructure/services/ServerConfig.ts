import { serverConfig } from '../../libs/server-config';
import { IServerConfig } from '../../application/ports/services/IServerConfig';
import { ServerConfigOptions } from '../../domain/types/ServerConfig';

export class ServerConfig implements IServerConfig {
    getVariables(): ServerConfigOptions {
        return serverConfig();
    }
}
