import { ServerConfigOptions } from '../../../domain/types/ServerConfig';

export interface IServerConfig {
    getVariables(): ServerConfigOptions;
}
