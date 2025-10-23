import i18n from 'i18next';
import fs from 'node:fs/promises';
import { JsonObject } from '../../domain/types/JsonStruct';

/**
 * Initialize i18n with one namespace : "translation", and no resources.
 * Use loadString/loadFolder to add resources before rendering anything
 * All is global here ; no separated instance.
 */
export async function init() {
    return i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        debug: false,
        ns: ['translation'],
        resources: {},
    });
}

export function defineStrings(data: JsonObject, lng: string, ns: string = 'translation') {
    return i18n.addResourceBundle(lng, ns, data);
}

/**
 * Adds a JSON files to the resources. Loads the Json from the file system
 * @param location json file full location
 * @param lng language of the json file ('fr', 'en', ...)
 * @param ns namespace (by default "translation") you should not change that before setting a full namespace support.
 */
export async function loadStrings(location: string, lng: string, ns: string = 'translation') {
    const data = await fs.readFile(location, 'utf8');
    return defineStrings(JSON.parse(data), lng, ns);
}

/**
 * load an entire folder of json files as resources.
 * The folder sub directory structure must be :
 * 📁 location
 * ├── 📁 fr
 * │   ├── 📄 file1.json
 * │   └── 📄 file2.json
 * └── 📁 en
 *     ├── 📄 file1.json
 *     └── 📄 file2.json
 *
 * @param location
 * @param aNamespaces should be left empty or undefined, no namespace support at the moment
 */
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

/**
 * Change i18n language
 * @param lang fr, en ...
 */
export function setLang(lang: string) {
    return i18n.changeLanguage(lang);
}

/**
 * Renders a string
 * @param key string identifier in i18n notation
 * @param parameters rendering parameters
 */
export function render(key: string, parameters?: JsonObject) {
    if (parameters) {
        parameters = { ...parameters, interpolation: { escapeValue: false } };
    } else {
        parameters = { interpolation: { escapeValue: false } };
    }
    return i18n.t(key, parameters);
}
