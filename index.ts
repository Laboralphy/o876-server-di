import { Server } from './src/server';
import { printDbg } from './src/libs/print-dbg';

const debugMain = printDbg('main');

async function main() {
    debugMain('initialization');
    const server = new Server();
    return server.run();
}

main().then(() => debugMain('initialization done'));
