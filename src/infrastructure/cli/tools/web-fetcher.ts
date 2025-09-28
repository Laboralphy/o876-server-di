import { JsonObject } from '../../../domain/types';
import { getEnv } from '../../../config/dotenv';

function buildUrl(url: string): string {
    const port = getEnv().SERVER_HTTP_API_PORT;
    return `http://localhost:${port}/${url}`;
}

export async function wfGet(url: string) {
    const response = await fetch(buildUrl(url), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        console.error(await response.text());
        return null;
    }
    const { data } = await response.json();
    return data;
}

export async function wfPost(url: string, body: JsonObject) {
    const response = await fetch(buildUrl(url), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        console.error(await response.text());
        return null;
    }
    return response.json();
}

export async function wfPut(url: string, body: JsonObject) {
    const response = await fetch(buildUrl(url), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        console.error(await response.text());
        return null;
    }
    return response.json();
}
