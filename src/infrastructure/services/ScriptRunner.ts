import Sandbox from '@nyariv/sandboxjs';
import { IExecContext, IScope } from '@nyariv/sandboxjs/dist/node/utils';
import { IScriptRunner } from '../../application/ports/services/IScriptRunner';

type ScriptReturnType = void | Promise<void>;

type CompiledScript<T> = (...scopes: IScope[]) => {
    context: IExecContext;
    run: () => T;
};

export class ScriptRunner implements IScriptRunner {
    private readonly scripts = new Map<string, CompiledScript<ScriptReturnType>>();
    private readonly sandbox = new Sandbox();
    private readonly baseContext: Record<string, never> = {};

    constructor() {
        // Script map
    }

    /**
     * Define base context
     * @param context
     */
    setContext(context: Record<string, never>) {
        Object.assign(this.baseContext, context);
    }

    /**
     * Compiles a script. In this architecture we don't take care of any returned value.
     * @param id script identifier
     * @param sSource js source of script
     */
    compile(id: string, sSource: string) {
        const compiled = this.sandbox.compile<ScriptReturnType>(sSource);
        this.scripts.set(id, compiled);
    }

    async run(id: string, context: Record<string, never>) {
        const script = this.scripts.get(id);
        if (script) {
            const ctx = {
                ...this.baseContext,
                ...context,
            };
            await script(ctx).run();
        }
    }
}
