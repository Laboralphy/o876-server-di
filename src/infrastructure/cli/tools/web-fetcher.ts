import { JsonObject, JsonValue } from '../../../domain/types/JsonStruct';
import { getEnv } from '../../../boot/dotenv';
import { HTTP_STATUS } from '../../../domain/enums/http-status';

type FetchErrorCause = {
    code: string;
    address: string;
    port: number;
};

type FetchError = Error & { cause: FetchErrorCause };

function buildUrl(url: string): string {
    const port = getEnv().SERVER_HTTP_API_PORT;
    return `http://localhost:${port}/${url}`;
}

export class HttpError extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super(message);
        this.name = this.constructor.name; // Pour le débogage (ex: "HttpError")
        Error.captureStackTrace?.(this, this.constructor); // Conserve la stack trace
    }
}

export async function doJsonRequest(
    method: string,
    url: string,
    body?: JsonObject
): Promise<JsonValue> {
    const payload: { [key: string]: JsonValue } = {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    };
    if (body) {
        payload.body = JSON.stringify(body);
    }
    const sFinalUrl = buildUrl(url);
    const response = await fetch(sFinalUrl, payload);
    if (response.ok) {
        if (response.status !== HTTP_STATUS.NO_CONTENT) {
            return response.json();
        } else {
            return '';
        }
    } else {
        const sErrorMessage = await response.text();
        throw new HttpError(response.status, sErrorMessage);
    }
}

export async function wfGet<T>(url: string): Promise<T> {
    try {
        const data = await doJsonRequest('GET', url);
        return data as T;
    } catch (err) {
        const error = err as FetchError;
        const cause = error.cause ?? { code: '', address: '', port: 0 };
        if (cause.code === 'ECONNREFUSED') {
            console.error('Host unreachable at %s port %d', cause.address, cause.port);
        }
        process.exit(2);
    }
}

export async function wfPost(url: string, body: JsonObject) {
    return doJsonRequest('POST', url, body);
}

export async function wfPut(url: string, body: JsonObject) {
    return doJsonRequest('PUT', url, body);
}

export async function wfPatch(url: string, body: JsonObject) {
    return doJsonRequest('PATCH', url, body);
}

export async function wfDelete(url: string) {
    await doJsonRequest('DELETE', url);
}
