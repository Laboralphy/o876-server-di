import { NodeVM, VMScript } from 'vm2';
import { IScriptRunner } from '../../application/ports/services/IScriptRunner';
import path from 'node:path';
import fs from 'node:fs';

type ScriptStruct = {
    program: VMScript;
    path: string;
};

export class ScriptRunner implements IScriptRunner {
    private readonly scripts = new Map<string, ScriptStruct>();
    private readonly baseContext: Record<string, unknown> = {};

    /**
     * Define base context
     * @param context
     */
    setContext(context: Record<string, unknown>) {
        Object.assign(this.baseContext, context);
    }

    /**
     * Compiles a script. In this architecture we don't take care of any returned value.
     * @param id script identifier
     * @param sSource js source of script
     */
    compile(id: string, sSource: string, sScriptFullPath: string) {
        // Avec vm2, on ne "compile" pas à l'avance comme avec SandboxJS,
        // mais on stocke le source pour l'exécuter plus tard avec le contexte.
        this.scripts.set(id, {
            program: new VMScript(sSource),
            path: sScriptFullPath,
        });
    }

    async run(id: string, context: Record<string, any>) {
        const script = this.scripts.get(id);
        if (script) {
            const ctx = {
                ...this.baseContext,
                ...context,
            };
            const vm = new NodeVM({
                console: 'inherit', // Capture les logs
                sandbox: ctx, // Contexte vide par défaut
                require: {
                    external: false, // Active/Désactive les modules externes
                    builtin: [console], // Désactive les modules built-in
                    customRequire: (id: string) => {
                        console.log(id);
                        throw new Error('CUSTOM_REQUIRE');
                    },
                    resolve: (moduleName: string, baseDir: string) => {
                        console.log(moduleName, baseDir);
                        throw new Error('RESOLVE');
                    },
                },
                timeout: 1000, // Timeout en ms
                allowAsync: true, // Autorise les opérations asynchrones si nécessaire
                eval: false, // Désactive eval et Function
                wasm: false, // Désactive WebAssembly
            });
            try {
                // Exécute le script dans le contexte
                await vm.run(script.program);
            } catch (err) {
                console.error(
                    `Erreur lors de l'exécution du script ${id}:`,
                    (err as Error).message
                );
                throw err;
            }
        }
    }
}
