import { initHelper as initHelperT } from './helpers/t';
import { FsHelper } from 'o876-fs-ts';
import handlebars from 'handlebars';
import { printDbg } from '../print-dbg';
import path from 'node:path';

const debugHbs = printDbg('hbs');

const oRegistry = new Map<string, HandlebarsTemplateDelegate>();

export function initHelpers() {
    debugHbs('initializing helpers');
    initHelperT();
}

export async function loadTemplates(sLocation: string) {
    const sNormLocation = path.normalize(sLocation);
    debugHbs('searching templates at location : %s', sNormLocation);
    const fsh = new FsHelper();
    const aFiles = await fsh.files(sLocation);
    const aProms = aFiles.map(async (file: string) => {
        const sContent = await fsh.read(file);
        const oTemplate = handlebars.compile(sContent);
        const key = file.substring(sNormLocation.length + 1);
        oRegistry.set(key, oTemplate);
    });
    await Promise.all(aProms);
    debugHbs('compiled %d template(s)', aProms.length);
}

export async function initHandlebars(sLocation: string) {
    initHelpers();
    await loadTemplates(sLocation);
}

export function getTemplate(key: string) {
    return oRegistry.get(key + '.hbs');
}
