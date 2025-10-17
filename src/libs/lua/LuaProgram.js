import fengari from 'fengari';

const {
    FENGARI_COPYRIGHT,
    to_jsstring,
    to_luastring,
    lua: {
        LUA_ERRSYNTAX,
        LUA_MULTRET,
        LUA_OK,
        LUA_REGISTRYINDEX,
        LUA_TSTRING,
        LUA_TNUMBER,
        LUA_TBOOLEAN,
        LUA_TNIL,
        LUA_TTABLE,
        LUA_YIELD,
        lua_createtable,
        lua_getglobal,
        lua_gettop,
        lua_insert,
        lua_pcall,
        lua_newthread,
        lua_resume,
        lua_yield,
        lua_pop,
        lua_pushboolean,
        lua_pushnumber,
        lua_pushnil,
        lua_pushcfunction,
        lua_pushliteral,
        lua_pushstring,
        lua_rawgeti,
        lua_remove,
        lua_setfield,
        lua_setglobal,
        lua_seti,
        lua_settop,
        lua_tojsstring,
        lua_tostring,
        lua_tonumber,
        lua_toboolean,
        lua_tonil,
        lua_tothread,
        lua_type,
        lua_close,
    },
    lauxlib: {
        luaL_callmeta,
        luaL_checkstack,
        luaL_error,
        luaL_len,
        luaL_loadbuffer,
        luaL_loadfile,
        luaL_newstate,
        luaL_traceback,
        luaL_typename,
        lua_writestringerror,
    },
    lualib: { LUA_VERSUFFIX, luaL_openlibs },
} = fengari;

class LuaProgram {
    constructor() {
        this.L = luaL_newstate();
        this.pendingResolvers = new Map(); // { thread: resolve }
        luaL_openlibs(this.L);
    }

    /**
     * Loads a Lua Chunk in VM
     * @param {string} chunkCode
     * @param {string} chunkName
     */
    loadChunk(chunkCode, chunkName = 'chunk') {
        if (luaL_loadbuffer(this.L, Buffer.from(chunkCode), chunkName) !== LUA_OK) {
            const error = lua_tostring(this.L, -1);
            throw new Error(`Chunk loading error "${chunkName}": ${error}`);
        }
        if (lua_pcall(this.L, 0, LUA_MULTRET, 0) !== LUA_OK) {
            const error = lua_tostring(this.L, -1);
            throw new Error(`Chunk execution error "${chunkName}": ${error}`);
        }
    }

    /**
     * Loads a set of chunks Lua
     * @param {Array<{code: string, name: string}>} chunks
     */
    loadPackage(chunks) {
        chunks.forEach(({ code, name }) => this.loadChunk(code, name));
    }

    /**
     * Retrieve a Lua value from the stack
     * @param L
     * @param {number} index
     * @returns {any}
     */
    _getLuaValue(L, index) {
        const type = lua_type(L || this.L, index);
        switch (type) {
            case LUA_TNUMBER: {
                return lua_tonumber(L || this.L, index);
            }
            case LUA_TSTRING: {
                return this._decodeUint8Array(lua_tostring(L || this.L, index));
            }
            case LUA_TBOOLEAN: {
                return lua_toboolean(L || this.L, index) === 1;
            }
            case LUA_TNIL: {
                return null;
            }
            default: {
                throw new Error(`Unsupported type: ${type}`);
            }
        }
    }

    /**
     * Calls a lua function by its name
     * @param {string} funcName
     * @param {Array} args
     * @returns {any}
     */
    callFunction(funcName, args = []) {
        const L = this.L;
        lua_getglobal(L, funcName);
        args.forEach((arg) => {
            if (typeof arg === 'number') {
                lua_pushnumber(L, arg);
            } else if (typeof arg === 'string') {
                lua_pushstring(L, arg);
            } else if (typeof arg === 'boolean') {
                lua_pushboolean(L, arg);
            } else if (arg === null) {
                lua_pushnil(L);
            } else throw new Error(`Unsupported argument type: ${typeof arg}`);
        });

        if (lua_pcall(L, args.length, 1, 0) !== LUA_OK) {
            const error = lua_tostring(this.L, -1);
            throw new Error(`Call error "${funcName}": ${error}`);
        }

        const result = this._getLuaValue(L, -1);
        lua_pop(L, 1);
        return result;
    }

    /**
     * Binds a javascript function to a Lua name
     * @param {string} name
     * @param {Function} func
     */
    bindSyncFunction(name, func) {
        lua_pushcfunction(this.L, (L) => {
            const nargs = lua_gettop(L);
            const args = [];
            for (let i = 1; i <= nargs; i++) {
                args.push(this._getLuaValue(L, i));
            }
            const result = func(...args);
            if (typeof result === 'number') {
                lua_pushnumber(L, result);
            } else if (typeof result === 'string') {
                lua_pushstring(L, result);
            } else if (typeof result === 'boolean') {
                lua_pushboolean(L, result);
            } else if (result === undefined || result === null) {
                lua_pushnil(L);
            } else {
                throw new Error(`Unsupported return type: ${typeof result}`);
            }
            return 1;
        });
        lua_setglobal(this.L, name);
    }

    /**
     * Returns true if parameter is a Promise
     * @param x
     * @private
     */
    _isPromiseLike(x) {
        return x && typeof x === 'object' && (x instanceof Promise || typeof x.then === 'function');
    }

    /**
     * Push a JS value on stack
     */
    _pushLuaValue(L, value) {
        if (typeof value === 'number') {
            lua_pushnumber(L, value);
        } else if (typeof value === 'string') {
            lua_pushstring(L, value);
        } else if (typeof value === 'boolean') {
            lua_pushboolean(L, value);
        } else if (value === undefined || value === null) {
            lua_pushnil(L);
        } else {
            throw new Error(`Unsupported type: ${typeof value}`);
        }
    }

    /**
     * Binds a javascript function to a Lua name
     * @param {string} name
     * @param {Function} func
     */
    bindFunction(name, func) {
        lua_pushcfunction(this.L, (L) => {
            const nargs = lua_gettop(L);
            const args = [];
            for (let i = 1; i <= nargs; i++) {
                args.push(this._getLuaValue(L, i));
            }

            const result = func(...args);
            if (this._isPromiseLike(result)) {
                // Fonction asynchrone : suspend la coroutine
                console.log('PROMISE !!');
                const co = lua_tothread(L, 1); // Récupère la coroutine en cours
                result.then(
                    (value) => {
                        console.log('PROMISE RESOLVED ?');
                        const resolve = this.pendingResolvers.get(co);
                        if (resolve) {
                            console.log('YES PROMISE RESOLVED');
                            this.pendingResolvers.delete(co);
                            this._pushLuaValue(co, value);
                            lua_resume(co, L, 1); // Reprend avec le résultat
                        }
                        console.log('PROMISE NOT RESOLVED');
                    },
                    (error) => {
                        console.log('PROMISE ERROR');
                        const resolve = this.pendingResolvers.get(co);
                        if (resolve) {
                            this.pendingResolvers.delete(co);
                            lua_pushnil(co);
                            lua_pushstring(co, error.message);
                            lua_resume(co, L, 2); // Reprend avec l'erreur
                        }
                        console.log('PROMISE ERROR NOT RESOLVED');
                    }
                );
                return lua_yield(L, 0); // Suspend la coroutine
            } else {
                // Fonction synchrone : retourne le résultat directement
                this._pushLuaValue(L, result);
                return 1;
            }
        });
        lua_setglobal(this.L, name);
    }

    /**
     * Exécute un chunk Lua dans une coroutine
     * @param {string} chunkCode
     * @returns {Promise<any>} Résultat du chunk
     */
    async runInCoroutine(chunkCode) {
        // Crée une nouvelle coroutine
        const co = lua_newthread(this.L);
        if (luaL_loadbuffer(co, Buffer.from(chunkCode), 'coroutine_chunk') !== LUA_OK) {
            throw new Error(this._decodeUint8Array(lua_tostring(co, -1)));
        }

        return new Promise((resolve, reject) => {
            console.log('START PROMISE');
            this.pendingResolvers.set(co, resolve);
            const status = lua_resume(co, this.L, 0);
            if (status === LUA_YIELD) {
                console.log('RESUME: CO ROUTINE YIELD');
                // La coroutine est suspendue, on attend la résolution
                return;
            } else if (status !== LUA_OK) {
                console.log('RESUME: CO ROUTINE OK');
                const error = this._decodeUint8Array(lua_tostring(co, -1));
                this.pendingResolvers.delete(co);
                reject(new Error(error));
            } else {
                // Résultat immédiat
                console.log('RESUME: CO ROUTINE STATUS ELSE : RESULT');
                const result = this._getLuaValue(co, -1);
                lua_pop(co, 1);
                this.pendingResolvers.delete(co);
                resolve(result);
            }
        });
    }

    /**
     * Close Lua state
     */
    close() {
        lua_close(this.L);
    }

    // Convertit un Uint8Array ou Buffer en chaîne UTF-8
    _decodeUint8Array(buffer) {
        if (buffer instanceof Uint8Array) {
            return Buffer.from(buffer).toString('utf8');
        }
        return buffer;
    }
}

const program = new LuaProgram();

program.loadPackage([
    { name: 'math_utils', code: 'function square(x) return x * x end' },
    {
        name: 'greetaaa',
        code: "function groot(name) return 'Hello, ' .. name .. '! Square of 5 is ' .. square(5) end",
    },
]);

program.bindFunction('log', console.log);
program.bindFunction('log2', () => console.log('XXXXXXXXXXXXXXXXXXXX'));
program.bindFunction('asynclog', async (msg) => {
    console.log('[Lua log]', msg);
    return `Logged: ${msg}`;
});

const result = program.callFunction('groot', ['Alice']);
console.log(result); // "Hello, Alice! Square of 5 is 25"
const result2 = program.callFunction('groot', ['Bob']);
console.log(result2); // "Hello, Bob! Square of 5 is 25"

// Exécute un chunk Lua avec une coroutine
program
    .runInCoroutine(
        `
  local result = asynclog("Hello, async world!")
  return result
`
    )
    .then((result) => {
        console.log('Résultat final :', result); // "Logged: Hello, async world!"
        console.log('pending resolvers count:', program.pendingResolvers.size);
        program.close();
    })
    .catch(console.error);

program.loadChunk("log('Ceci vient de Lua!')");
console.log('pending resolvers count:', program.pendingResolvers.size);
