import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './infrastructure/web/routes/user.routes';
import { container } from './config/container';
import { scopePerRequest } from 'awilix-koa';
import { printDbg } from './libs/print-dbg';
import { getEnv } from './config/dotenv';
import { FsHelper } from 'o876-fs-ts';
import { expandPath } from './libs/expand-path';
import telnet, { TelnetClient } from '../@types/telnet2';

const debugServer = printDbg('server');

export class Server {
    private readonly httpApi: Koa;
    private readonly env = getEnv();
    private readonly fsHelper = new FsHelper();

    constructor() {
        this.httpApi = new Koa();
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
        const port = parseInt(this.env.SERVER_HTTP_API_PORT ?? '8080');
        const app = this.httpApi;

        // Database
        await this.initDatabase();

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
            app.listen(port, '127.0.0.1', () => {
                debugServer('http api service is now listening on port %d', port);
                resolve(true);
            });
        });
    }

    async initTelnet() {
        debugServer('starting telnet service');
        telnet.createServer(
            {
                convertLF: false,
            },
            () => {
                return telnet.createServer(
                    {
                        convertLF: false,
                    },
                    (client: TelnetClient) => {
                        try {
                            this.connectClient(client);
                        } catch (err) {
                            console.error(
                                'Error during client connection phase :',
                                (err as Error).message
                            );
                            client.end();
                        }
                    }
                );
            }
    }

    async initTelnetService() {
        debugServer('initializing telnet service');
    }

    async initWebsocketService() {
        debugServer('initializing websocket service');
    }

    async run() {
        await this.initDataDirectory();
        await this.initDatabase();
        await this.initApiService();
        await this.initTelnetService();
        await this.initWebsocketService();
    }
}
