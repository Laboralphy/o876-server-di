export interface IScriptRunner {
    /**
     * Defines a common context, sent to all script at run time
     * this context contains properties that are useful for any script
     * @param context
     */
    setContext(context: Record<string, never>): void;

    /**
     * Returns all script names
     */
    get scriptNames(): string[];

    /**
     * Compiles a script source code.
     * You must provide an identifier to fetch script at later moment
     * the full path is usefull for "require" calls
     * @param id script identifier
     * @param sSource script source code (js)
     * @param sFullPath is used to resolve relative requires
     * @param eventScript if true, the script will not overwrite a former script with same id, both will be run
     */
    compile(id: string, sSource: string, sFullPath: string, eventScript: boolean): void;

    /**
     * Run a specific script with a specific partial context.
     * Before execution the specific context is merged with common context and passed to script
     * @param id
     * @param context
     */
    run(id: string, context: Record<string, any>): void | Promise<void>;
}
