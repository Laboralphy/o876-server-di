import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './infrastructure/web/routes/user.routes';
import { container, createClientContainer } from './boot/container';
import { CHANNEL_DEFINITION } from './boot/channels';
import { scopePerRequest } from 'awilix-koa';
import { debug } from './libs/o876-debug';
import { getEnv } from './boot/dotenv';
import { expandPath } from './libs/expand-path';
import telnet, { Server as TelnetServer, Client as TelnetClient } from 'telnet2';
import path from 'node:path';
import fs from 'node:fs/promises';

const debugServer = debug('srv:main');

export class Server {
    private readonly httpApi: Koa;
    private readonly telnetServer: TelnetServer;
    private readonly env = getEnv();

    constructor() {
        // all service are constructed during this instance construction
        // so we don't have to declare those variables | undefined
        this.httpApi = new Koa();
        this.telnetServer = this.createTelnetServer();
    }

    createTelnetServer(): TelnetServer {
        // Example of creating GMCP telnet option
        telnet.OPTIONS.GMCP = 201;
        telnet.OPTION_NAMES['201'] = 'gmcp';
        // at client connection :
        // socket.do.gmcp()
        return telnet.createServer({
            convertLF: false,
        });
    }

    async initLocales() {
        const oServerConfig = container.resolve('serverConfig');
        const lng = oServerConfig.getVariables().language ?? 'en';
        debugServer('loading i18n strings (language: %s)', lng);
        const oStringRepository = container.resolve('stringRepository');
        await oStringRepository.init();
        await oStringRepository.setLanguage(lng);
    }

    async initHbs() {
        debugServer('loading templates');
        const oTemplateRepository = container.resolve('templateRepository');
        oTemplateRepository.init();
    }

    async initModules() {
        debugServer('initializing modules');
        const mm = container.resolve('moduleManager');
        await mm.loadModuleFromFolder(path.resolve(__dirname, '../modules/_base'));
    }

    /**
     * Build directory tree, for storing json-database, modules ...
     */
    async initDataDirectory() {
        if (!this.env.SERVER_MODULE_PATH) {
            throw new Error(`Environment variable not set : SERVER_MODULE_PATH`);
        }
        const sModuleLocation = expandPath(this.env.SERVER_MODULE_PATH);
        debugServer('module directory is %s', sModuleLocation);
        await fs.mkdir(sModuleLocation, { recursive: true });
    }

    async initDatabase() {
        debugServer('initializing json-database');
        const database = container.resolve('database');
        await database.init({
            host: this.env.SERVER_DB_HOST ?? '',
            user: this.env.SERVER_DB_USER ?? '',
            password: this.env.SERVER_DB_PASSWORD ?? '',
            port: parseInt(this.env.SERVER_DB_PORT ?? ''),
            name: this.env.SERVER_DB_NAME ?? '',
        });
    }

    async initChatService() {
        debugServer('initializing chat service');
        const chatManager = container.resolve('chatManager');
        for (const cd of CHANNEL_DEFINITION) {
            debugServer('- chat channel %s', cd.id);
            chatManager.defineChannel(cd);
        }
    }

    /**
     * Start http service on
     */
    async initApiService() {
        debugServer('starting api service');
        const app = this.httpApi;

        // Middlewares
        debugServer('initializing middlewares');
        app.use(bodyParser());
        app.use(scopePerRequest(container));

        // Routes.
        // Each route is declared as middleware
        // and receive its controller dependencies on construction
        debugServer('initializing routes');
        app.use(userRoutes(container.resolve('apiUserController')).routes());
        return new Promise((resolve) => {
            // Start listening
            const port = parseInt(this.env.SERVER_HTTP_API_PORT ?? '8080');
            this.httpApi.listen(port, '127.0.0.1', () => {
                debugServer('http api service is now listening on port %d', port);
                resolve(undefined);
            });
        });
    }

    initTelnetService(): Promise<void> {
        debugServer('starting telnet service');
        this.telnetServer.on('client', async (client: TelnetClient) => {
            try {
                client.do.transmit_binary(); // easier unicode character transmission
                client.do.window_size(); // make the client emit 'window size' events
                client.do.gmcp(); // accept GMCP client
                const uidg = container.resolve('idGenerator');
                const idClient = uidg.generateUID();
                debugServer('incoming client %s', idClient);
                const clientScope = createClientContainer(idClient);
                const telnetClientController = clientScope.resolve('telnetClientController');
                client.on('close', () => {
                    clientScope.dispose();
                    debugServer('dispose client %s context', idClient);
                });
                await telnetClientController.connect(client);
            } catch (err) {
                console.error('Error during client connection phase :', err);
                client.end();
            }
        });
        return new Promise((resolve) => {
            const port = parseInt(this.env.SERVER_TELNET_PORT ?? '8080');
            this.telnetServer.listen(port, () => {
                debugServer('telnet service is now listening on port %d', port);
                resolve(undefined);
            });
        });
    }

    async initWebsocketService() {
        debugServer('initializing websocket service');
    }

    async gracefulShutdown() {
        // Graceful shutdown telnet service
        const pTelnetClose = new Promise((resolve) => {
            debugServer('shutting down telnet service');
            this.telnetServer.close(() => {
                resolve(undefined);
            });
        });
        debugServer('expelling all clients');
        const communicationLayer = container.resolve('communicationLayer');
        communicationLayer.dropAllClients();
        await pTelnetClose;
        debugServer('all services gracefully shut down');
    }

    async run() {
        await this.initLocales();
        await this.initHbs();
        await this.initDataDirectory();
        await this.initDatabase();
        await this.initChatService();
        await this.initApiService();
        await this.initTelnetService();
        await this.initWebsocketService();
        await this.initModules();

        process.on('SIGTERM', async () => {
            debugServer('receiving SIGTERM');
            await this.gracefulShutdown();
        });

        process.on('SIGINT', async () => {
            debugServer('receiving SIGINT');
            await this.gracefulShutdown();
            process.exit();
        });
    }
}
