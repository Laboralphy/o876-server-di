import { JsonObject, JsonValue } from '../../../domain/types';
import { getEnv } from '../../../config/dotenv';
import { HttpStatus } from '../../../domain/enums';

function buildUrl(url: string): string {
    const port = getEnv().SERVER_HTTP_API_PORT;
    return `http://localhost:${port}/${url}`;
}

type ResultRequest = {
    data: JsonValue | undefined;
};

async function doJsonRequest(
    method: string,
    url: string,
    body?: JsonObject
): Promise<ResultRequest | undefined> {
    const payload: { [key: string]: JsonValue } = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        payload.body = JSON.stringify(body);
    }
    const sFinalUrl = buildUrl(url);
    const response = await fetch(sFinalUrl, payload);
    if (!response.ok) {
        const sErrorMessage = await response.text();
        throw new Error(`error ${response.status} : ${sErrorMessage}`);
    }
    const sContentType = response.headers.get('content-type');
    const bJson = (sContentType ?? '').includes('application/json');
    if (bJson) {
        const result = await response.json();
        if ('data' in result) {
            return {
                data: result.data,
            };
        } else {
            throw new Error(
                `output malformed : end point ${sFinalUrl} result did not have "data" property`
            );
        }
    } else {
        return {
            data: await response.text(),
        };
    }
}

export async function wfGet(url: string): Promise<ResultRequest> {
    const content = await doJsonRequest('GET', url);
    if (!content) {
        return { data: undefined };
    }
    return content;
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
