import dotenv from 'dotenv';
dotenv.config();

let bOkVariables: boolean = false;

function checkVariables() {
    const VARIABLES = [
        'SERVER_LANGUAGE',
        'SERVER_MODULE_PATH',
        'SERVER_HTTP_API_PORT',
        'SERVER_TELNET_PORT',
        'SERVER_WEBSOCKET_PORT',
        'SERVER_DB_HOST',
        'SERVER_DB_PORT',
        'SERVER_DB_USER',
        'SERVER_DB_PASSWORD',
        'SERVER_DB_NAME',
    ];
    const aMissingVariables = VARIABLES.filter((v) => {
        return process.env[v] === undefined;
    });
    if (aMissingVariables.length > 0) {
        throw new Error(`List of missing environment variables : ${aMissingVariables.join(', ')}`);
    }
    bOkVariables = true;
}

export function getEnv() {
    if (!bOkVariables) {
        checkVariables();
    }
    return process.env;
}
