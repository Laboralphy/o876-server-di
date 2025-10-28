import { Server } from './src/server';
import { debug } from './src/libs/o876-debug';
import { name, version, description } from './package.json';
import { BrailleBanner } from './src/libs/o876-banner/BrailleBanner';

const debugMain = debug('srv:main');

async function main() {
    console.log(BrailleBanner.renderString(name));
    console.log(description);
    console.log('version %s', version);
    debugMain('starting application');
    const server = new Server();
    return server.run();
}

main().then(() => debugMain('initialization done'));
