import { Server } from './src/server';
import { debug } from './src/libs/o876-debug';
import { name, version, description } from './package.json';

const debugMain = debug('srv:main');

async function main() {
    console.log('%s - version %s', name, version);
    console.log(description);
    debugMain('starting application');
    const server = new Server();
    return server.run();
}

main().then(() => debugMain('initialization done'));
