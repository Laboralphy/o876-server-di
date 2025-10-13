// factories/ScriptFactory.ts
import { FsHelper } from 'o876-fs-ts';
import path from 'node:path';

export interface IScript<TArgs extends any[] = any[]> {
    main(...args: TArgs): Promise<void>;
}

export class ScriptFactory<TArgs extends any[] = any[]> {
    private scripts: Map<string, IScript<TArgs>> = new Map();

    private async importScript(modulePath: string): Promise<IScript<TArgs>> {
        console.log(modulePath);
        const module = await import(modulePath);
        const script: IScript<TArgs> = 'default' in module ? module.default : module;
        if (!script.main || typeof script.main !== 'function') {
            throw new Error(`module ${modulePath} does not match interface IScript.`);
        }
        const scriptName = path.basename(modulePath, '.ts');
        this.scripts.set(scriptName, script);
        return script;
    }

    async loadScripts(directory: string): Promise<void> {
        const fsh = new FsHelper();
        const scriptPaths = await fsh.files(directory);

        for (const scriptPath of scriptPaths) {
            await this.importScript(scriptPath);
        }
    }

    async runScript(name: string, ...args: TArgs): Promise<void> {
        const module = this.scripts.get(name);
        if (module) {
            await module.main(...args);
        }
    }

    getModule(name: string): IScript<TArgs> | undefined {
        return this.scripts.get(name);
    }

    listModules(): string[] {
        return Array.from(this.scripts.keys());
    }
}
