import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './infrastructure/web/routes/user.routes';
import { container } from './config/container';
import { scopePerRequest } from 'awilix-koa';
import { printDbg } from './libs/print-dbg';
import { getEnv } from './config/dotenv';
import { FsHelper } from 'o876-fs-ts';
import { expandPath } from './libs/expand-path';
import telnet, { Server as TelnetServer, Client as TelnetClient } from 'telnet2';

const debugServer = printDbg('server');

export class Server {
    private readonly httpApi: Koa;
    private telnetServer: TelnetServer;
    private readonly env = getEnv();
    private readonly fsHelper = new FsHelper();

    constructor() {
        // all service are constructed during this instance construction
        // so we dont have to declare those variables | undefined
        this.httpApi = new Koa();
        this.telnetServer = this.initTelnetService();
    }

    /**
     * Build directory tree, for storing json-database, modules ...
     */
    async initDataDirectory() {
        if (!this.env.PATH_MODULES) {
            throw new Error(`environment variable not set : PATH_MODULES`);
        }
        const sModuleLocation = expandPath(this.env.PATH_MODULES);
        debugServer('module directory is %s', sModuleLocation);
        await this.fsHelper.mkdir(sModuleLocation);
    }

    async initDatabase() {
        debugServer('json-database init phase');
        const database = container.resolve('database');
        await database.init({
            host: this.env.DB_HOST ?? '',
            user: this.env.DB_USER ?? '',
            password: this.env.DB_PASSWORD ?? '',
            port: parseInt(this.env.DB_PORT ?? ''),
            name: this.env.DB_NAME ?? '',
        });
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

    initTelnetService(): TelnetServer {
        debugServer('starting telnet service');
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
        await pTelnetClose;
        debugServer('all services gracefully shut down');
    }

    async run() {
        await this.initDataDirectory();
        await this.initDatabase();
        await this.initApiService();
        await this.initWebsocketService();

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
