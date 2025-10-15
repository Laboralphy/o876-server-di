import { NodeVM } from 'vm2';

class ScriptRunner {
    constructor() {
        const vm = new NodeVM({
            timeout: 2000,
            sandbox: {},
        });
    }
}
