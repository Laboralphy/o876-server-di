// fengari.d.ts
declare module 'fengari' {
    export class LuaState {
        constructor();

        /**
         * Execute a Lua chunk in the current vm state
         * @param chunk lua source code
         */
        doString(chunk: string): void;

        /**
         * Retrieve the value of a global variable
         * @param name name of the searched global variable
         */
        getGlobal(name: string): LuaValue;

        /**
         * Define a new global variable
         * @param name variable name
         * @param value variable value
         */
        setGlobal(name: string, value: LuaValue): void;

        /**
         * Register a JS function in lua
         * @param name function name
         * @param fn function itself
         */
        register(name: string, fn: (L: LuaState) => number): void;

        /**
         * Stacks a new strings
         * @param value
         */
        pushString(value: string): void;

        /**
         * Stacks a new number
         * @param value
         */
        pushNumber(value: number): void;

        /**
         * Pop a string value from the stack
         * @param index Pop the nth item from top of stack
         */
        toString(index: number): string;

        /**
         * Pop a number value from the stack
         * @param index Pop the nth item from top of stack
         */
        toNumber(index: number): number;

        /**
         * Checks if nth parameters is a string
         * @param index parameters rank
         */
        checkString(index: number): string;

        /**
         * Calls a Lua function
         * @param fn
         * @param nArgs
         * @param nResults
         */
        call(fn: any, nArgs: number, nResults: number): void;

        /**
         * remove items from stack
         * @param n
         */
        pop(n?: number): void;
    }

    /** Generic type for lua values */
    export type LuaValue = any;
}
