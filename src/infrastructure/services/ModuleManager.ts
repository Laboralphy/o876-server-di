/**
 * Manages modules
 * A module is a set of resources including :
 * - scripts
 * - locales
 * - templates
 * - json assets
 * - binary assets
 * This class provides these methods :
 * - load a new module
 */
import { JsonObject, JsonValue } from '../../domain/types/JsonStruct';
import { Cradle } from '../../boot/container';
import fs from 'node:fs/promises';
import path from 'node:path';
import { debug } from '../../libs/o876-debug';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';
import { IScriptRunner } from '../../application/ports/services/IScriptRunner';
import { IModuleManager } from '../../application/ports/services/IModuleManager';

const debugmm = debug('srv:module');

type AssetStatItemFormat = { count: number; size: number };

export class ModuleManager implements IModuleManager {
    private readonly assets = new Map<string, JsonObject>();
    private readonly scriptRunner: IScriptRunner;
    private readonly stringRepository: IStringRepository;
    private readonly templateRepository: ITemplateRepository;
    private readonly stats: Map<string, AssetStatItemFormat> = new Map();

    constructor(cradle: Cradle) {
        this.scriptRunner = cradle.scriptRunner;
        this.stringRepository = cradle.stringRepository;
        this.templateRepository = cradle.templateRepository;

        this.addStatCategory('locales');
        this.addStatCategory('templates');
        this.addStatCategory('scripts');
        this.addStatCategory('data');
    }

    addStatCategory(name: string): void {
        this.stats.set(name, { count: 0, size: 0 });
    }

    addStatCountSize(name: string, count: number, size: number) {
        const category = this.stats.get(name);
        if (category) {
            category.count += count;
            category.size += size;
        } else {
            throw new Error('Unknown StatCategory : ' + name);
        }
    }

    defineAssetScript(name: string, source: string) {
        this.addStatCountSize('scripts', 1, source.length);
        this.scriptRunner.compile(name, source);
    }

    defineAssetData(key: string, data: string) {
        this.addStatCountSize('data', 1, data.length);
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
        this.addStatCountSize('locales', this.getObjectValueCount(oStrings), data.length);
        this.stringRepository.defineStrings(oStrings, lng);
    }

    defineAssetTemplate(key: string, data: string) {
        this.addStatCountSize('templates', 1, data.length);
        this.templateRepository.defineTemplate(key, data);
    }

    renderSize(bytes: number): string {
        if (bytes < 1024) {
            return bytes.toFixed(1) + ' b';
        } else if (bytes < Math.pow(1024, 2)) {
            return (bytes / 1024).toFixed(1) + ' Kb';
        } else if (bytes < Math.pow(1024, 3)) {
            return (bytes / Math.pow(1024, 2)).toFixed(1) + ' Mb';
        } else {
            return (bytes / Math.pow(1024, 3)).toFixed(1) + ' Gb';
        }
    }

    printStats() {
        for (const [key, value] of this.stats.entries()) {
            const { count, size } = value;
            debugmm('> %s : %d (%s)', key, count, this.renderSize(size));
        }
    }

    async loadModuleFromFolder(location: string) {
        const aFiles = await fs.readdir(location, { recursive: true });
        for (const sPath of aFiles) {
            const sFullPath = path.normalize(path.join(location, sPath));
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
                    const aId = [...aPath, sId];
                    this.defineAssetScript(aId.join('/'), contentBuffer.toString());
                    break;
                }
                case 'locales': {
                    // determine language
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
        debugmm('module loaded from location : %s', location);
        this.printStats();
    }

    getAsset(name: string): JsonObject {
        const value = this.assets.get(name);
        if (value !== undefined) {
            return value;
        } else {
            throw new ReferenceError(`Asset not found ${name}`);
        }
    }

    runScript(idClient: string, key: string, parameters: string[]) {
        // run command
    }
}
