export interface IScriptRunner {
    /**
     * Defines a common context, sent to all script at run time
     * this context contains properties that are useful for any script
     * @param context
     */
    setContext(context: Record<string, never>): void;

    /**
     * Compiles a script source code.
     * You must provide an identifier to fetch script at later moment
     * @param id script identifier
     * @param sSource script source code (js)
     */
    compile(id: string, sSource: string): void;

    /**
     * Run a specific script with a specific partial context.
     * Before execution the specific context is merged with common context and passed to script
     * @param id
     * @param context
     */
    run(id: string, context: Record<string, any>): void | Promise<void>;
}
