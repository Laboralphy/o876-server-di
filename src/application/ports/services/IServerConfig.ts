export interface IServerConfig {
    getConfigVariableString(name: string): string;
    getConfigVariableNumber(name: string): number;
    getConfigVariableBoolean(name: string): boolean;
}
