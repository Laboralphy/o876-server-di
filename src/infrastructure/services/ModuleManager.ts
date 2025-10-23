/**
 * Manages modules
 * A module is a set of resources including :
 * - scripts
 * - strings
 * - templates
 * - json assets
 * - binary assets
 * This class provides these methods :
 * - load a new module
 */
import { ScriptRunner } from './ScriptRunner';
import { JsonObject, JsonValue } from '../../domain/types/JsonStruct';
import { Cradle } from '../../config/container';
import fs from 'node:fs/promises';
import path from 'node:path';
import { debuglog as debug } from 'node:util';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';

const debugmm = debug('module');

type AssetStatItemFormat = { count: number; size: number };
type AssetStat = {
    scripts: AssetStatItemFormat;
    strings: AssetStatItemFormat;
    data: AssetStatItemFormat;
    templates: AssetStatItemFormat;
};

export class ModuleManager {
    private readonly assets = new Map<string, JsonObject>();
    private readonly scriptRunner: ScriptRunner;
    private readonly stringRepository: IStringRepository;
    private readonly templateRepository: ITemplateRepository;
    private readonly stats: AssetStat;

    constructor(cradle: Cradle) {
        this.scriptRunner = cradle.scriptRunner;
        this.stringRepository = cradle.stringRepository;
        this.templateRepository = cradle.templateRepository;
        this.stats = {
            strings: {
                count: 0,
                size: 0,
            },
            templates: {
                count: 0,
                size: 0,
            },
            data: {
                count: 0,
                size: 0,
            },
            scripts: {
                count: 0,
                size: 0,
            },
        };
    }

    defineAssetScript(name: string, source: string) {
        ++this.stats.scripts.count;
        this.stats.scripts.size += source.length;
        this.scriptRunner.compile(name, source);
    }

    defineAssetData(key: string, data: string) {
        ++this.stats.data.count;
        this.stats.data.size += data.length;
        this.assets.set(key, JSON.parse(data));
    }

    private getObjectValueCount(obj: JsonValue): number {
        if (typeof obj === 'object') {
            if (obj === null) {
                return 0;
            }
            const a: JsonValue[] = Array.isArray(obj) ? obj : Object.values(obj);
            return a.reduce((acc: number, cur: JsonValue) => {
                return acc + this.getObjectValueCount(cur);
            }, 0);
        } else {
            return 1;
        }
    }

    defineAssetStrings(data: string, lng: string) {
        const oStrings = JSON.parse(data);
        this.stats.strings.count += this.getObjectValueCount(oStrings);
        this.stats.strings.size += data.length;
        this.stringRepository.defineStrings(oStrings, lng);
    }

    defineAssetTemplate(key: string, data: string) {
        ++this.stats.templates.count;
        this.stats.templates.size += data.length;
        this.templateRepository.defineTemplate(key, data);
    }

    async loadModuleFromFolder(location: string) {
        const aFiles = await fs.readdir(location, { recursive: true });
        for (const sPath of aFiles) {
            const sFullPath = path.normalize(path.resolve(location, sPath));
            const oStat = await fs.stat(sFullPath);
            if (oStat.isDirectory()) {
                continue;
            }
            const sExt = path.extname(sPath).substring(1);
            if (sExt == '') {
                continue;
            }
            const aPath = sPath.split('/');
            const sType = aPath.shift();
            if (sType === undefined) {
                continue;
            }
            const sFileName = aPath.pop();
            if (sFileName === undefined) {
                continue;
            }
            const sId = path.basename(sFileName, '.' + sExt);
            const contentBuffer = await fs.readFile(sFullPath);
            switch (sType) {
                case 'scripts': {
                    this.defineAssetScript(sId, contentBuffer.toString());
                    break;
                }
                case 'strings': {
                    // determine langage
                    const lng = aPath.shift();
                    if (lng === undefined) {
                        continue;
                    }
                    this.defineAssetStrings(contentBuffer.toString(), lng);
                    break;
                }
                case 'templates': {
                    this.defineAssetTemplate(sId, contentBuffer.toString());
                    break;
                }
                case 'data': {
                    this.defineAssetData(sId, contentBuffer.toString());
                    break;
                }
                default: {
                    // nothing to do if type is unknown, ignore resource.
                    break;
                }
            }
        }
    }
}
