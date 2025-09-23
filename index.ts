import { Server } from './src/server';

async function main() {
    const server = new Server();
    return server.run();
}

main().then(() => console.log('application running'));
