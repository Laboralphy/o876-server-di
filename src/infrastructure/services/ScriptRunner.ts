import { NodeVM, VMScript } from 'vm2';
import { IScriptRunner } from '../../application/ports/services/IScriptRunner';

export class ScriptRunner implements IScriptRunner {
    private readonly scripts = new Map<string, VMScript>();
    private readonly eventScripts = new Map<string, VMScript[]>();
    private readonly baseContext: Record<string, unknown> = {};

    /**
     * Define base context
     * @param context
     */
    setContext(context: Record<string, unknown>) {
        Object.assign(this.baseContext, context);
    }

    /**
     * Returns all script names
     */
    get scriptNames() {
        return [...this.scripts.keys(), ...this.eventScripts.keys()];
    }

    /**
     * Compiles a script. In this architecture we don't take care of any returned value.
     * @param id script identifier
     * @param sSource js source of script
     * @param sFullPath used to resolve relative requires
     * @param eventScript if true then marks this scripts as event script - all event script that share the same id are preserved
     * and are all run at once when the event occurs. For example :
     * @example
     * compile('script1', '<JavaScript source 1>', './event-1.js', true)
     * compile('script1', '<JavaScript source 2>', './event-2.js', true)
     * will keep both script, and :
     * run('script1', context)
     * will run <JavaScript source 1> AND <JavaScript source 2>
     */
    compile(id: string, sSource: string, sFullPath: string, eventScript: boolean): void {
        const oCompiledScript = new VMScript(sSource, sFullPath);
        if (eventScript) {
            // this is an event script,
            // in this case : id is not unique : we keep all scripts of the same id, in an array
            if (!this.eventScripts.has(id)) {
                // first time we define this id
                this.eventScripts.set(id, []);
            }
            const aEventScripts = this.eventScripts.get(id);
            if (Array.isArray(aEventScripts)) {
                // adding this compiled script in the list
                aEventScripts.push(oCompiledScript);
            } else {
                // this error should not happen, as the only way to set eventScripts item is in this function
                throw new ReferenceError(
                    `Event script list ${id} is of unexpected type (i.e. not array)`
                );
            }
        } else {
            this.scripts.set(id, oCompiledScript);
        }
    }

    /**
     * Will run a list of event script of the same id.
     * Does not cry if id is inexistant : just ignoring the command, but return false
     * otherwhise if a scripts as been run : return true
     */
    runEventHandlers(id: string, context: Record<string, any>): boolean {
        const aScripts = this.eventScripts.get(id);
        let bRun = false;
        if (Array.isArray(aScripts)) {
            for (const program of aScripts) {
                this.runProgram(program, context);
                bRun = true;
            }
        }
        return bRun;
    }

    private runProgram(program: VMScript, context: Record<string, any>) {
        const ctx = {
            ...this.baseContext,
            ...context,
        };
        const vm = new NodeVM({
            console: 'inherit', // allow use of console for debug purpose
            sandbox: ctx, // Context by default
            require: {
                external: true,
                root: './',
            },
            timeout: 1000, // Timeout (ms)
            allowAsync: true, // Allow async functions
            eval: false, // allow neither eval nor Function
            wasm: false, // Deactivatee WebAssembly
        });
        try {
            // Execute script in specified context
            return vm.run(program);
        } catch (err) {
            console.error(`Erreur lors de l'exécution du script.`, (err as Error).message);
            throw err;
        }
    }

    run(id: string, context: Record<string, any>) {
        if (this.eventScripts.has(id)) {
            return this.runEventHandlers(id, context);
        }
        const script = this.scripts.get(id);
        if (script) {
            return this.runProgram(script, context);
        }
    }
}
