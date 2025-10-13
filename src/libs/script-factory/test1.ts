import { ScriptFactory } from './index';
import { Context } from './Context';

async function main() {
    const sf = new ScriptFactory<[Context, string]>();
    await sf.loadScripts('./test-dir');
    await sf.runScript('test-dir', new Context(), 'alpha');
}

main();
