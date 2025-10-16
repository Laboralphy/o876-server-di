import fengari from 'fengari';
import fs from 'fs';
import path from 'path';

const MAIN_SCRIPT = 'index.lua';

export class LuaPackage {
    private lua: fengari.LuaState;

    constructor(private readonly packageName: string) {
        this.lua = new fengari.LuaState();
        this.loadMainScript();
    }

    private loadMainScript() {
        try {
            const mainScriptPath = path.join(__dirname, 'packages', this.packageName, MAIN_SCRIPT);
            const script = fs.readFileSync(mainScriptPath, 'utf8');
            this.lua.doString(script);
        } catch (e) {
            throw new Error(`Erreur de chargement du package ${this.packageName}: ${e.message}`);
        }
    }

    public executeFunction(functionName: string, ...args: any[]): string {
        const luaFunction = this.lua.getGlobal(functionName);
        if (!luaFunction) {
            throw new Error(
                `Fonction ${functionName} introuvable dans le package ${this.packageName}.`
            );
        }
        args.forEach((arg) => this.lua.pushString(String(arg)));
        this.lua.call(args.length, 1); // Appelle avec args.length arguments, attend 1 retour
        return this.lua.toString(-1);
    }
}
