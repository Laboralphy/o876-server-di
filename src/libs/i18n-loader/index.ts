import i18n from 'i18next';
import fs from 'node:fs/promises';
import { JsonObject } from '../../domain/types/JsonStruct';

export async function init() {
    return i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        debug: false,
        ns: ['translation'],
        resources: {},
    });
}

export async function loadStrings(location: string, lng: string, ns: string = 'translation') {
    const data = await fs.readFile(location, 'utf8');
    return i18n.addResourceBundle(lng, ns, JSON.parse(data));
}

export async function loadFolder(location: string, aNamespaces: string[] = []) {
    const aFiles = await fs.readdir(location, { recursive: true });
    return Promise.all(
        aFiles
            .map((file) => file.match(/^([a-z]+)\/([^/.]+)\.json$/i))
            .filter((r) => !!r)
            .map((r) => ({ file: r[0], lng: r[1], ns: r[2] }))
            .filter(({ ns }) => aNamespaces.length == 0 || aNamespaces.includes(ns))
            .map(({ file, lng }) => loadStrings(`${location}/${file}`, lng))
    );
}

export function setLang(lang: string) {
    return i18n.changeLanguage(lang);
}

export function render(key: string, parameters?: JsonObject) {
    if (parameters) {
        parameters = { ...parameters, interpolation: { escapeValue: false } };
    } else {
        parameters = { interpolation: { escapeValue: false } };
    }
    console.log('***********', parameters);
    return i18n.t(key, parameters);
}
