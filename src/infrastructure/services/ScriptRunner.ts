import { NodeVM, VMScript } from 'vm2';
import { IScriptRunner } from '../../application/ports/services/IScriptRunner';

export class ScriptRunner implements IScriptRunner {
    private readonly scripts = new Map<string, VMScript>();
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
    compile(id: string, sSource: string) {
        // Avec vm2, on ne "compile" pas à l'avance comme avec SandboxJS,
        // mais on stocke le source pour l'exécuter plus tard avec le contexte.
        this.scripts.set(id, new VMScript(sSource));
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
                    external: false, // Désactive les modules externes
                    builtin: [console], // Désactive les modules built-in
                    root: './',
                },
                timeout: 1000, // Timeout en ms
                allowAsync: true, // Autorise les opérations asynchrones si nécessaire
                eval: false, // Désactive eval et Function
                wasm: false, // Désactive WebAssembly
            });
            try {
                // Exécute le script dans le contexte
                await vm.run(script);
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
