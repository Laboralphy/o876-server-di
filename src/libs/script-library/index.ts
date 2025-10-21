import { Sandbox } from '@nyariv/sandboxjs';
import { IExecContext, IScope } from '@nyariv/sandboxjs/dist/node/utils';

type ScriptReturnType = void | Promise<void>;

type CompiledScript<T> = (...scopes: IScope[]) => {
    context: IExecContext;
    run: () => T;
};

class ScriptLibrary {
    private readonly scripts = new Map<string, CompiledScript<ScriptReturnType>>();
    private readonly sandbox = new Sandbox();

    constructor() {
        // Script map
    }

    compile(id: string, sSource: string) {
        const compiled = this.sandbox.compile(sSource);
        this.scripts.set(id, compiled);
    }

    runScript(id: string, parameters: Record<string, never>) {
        const compiled = this.scripts.get(id);
        if (compiled) {
            compiled({
                ...parameters,
            }).run();
        }
    }
}
