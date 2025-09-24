import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './infrastructure/web/routes/user.routes';
import { container } from './config/container';
import { scopePerRequest } from 'awilix-koa';
import { printDbg } from './libs/print-dbg';
import { getEnv } from './config/dotenv';
import { FsHelper } from 'o876-fs-ts';
import path from 'node:path';
import { expandPath } from './libs/expand-path';

const debugServer = printDbg('server');

export class Server {
    private readonly app: Koa;
    private readonly env = getEnv();
    private readonly fsHelper = new FsHelper();

    constructor() {
        this.app = new Koa();
    }

    async initDataDirectory() {
        const sDataLocation = this.env.DATA_HOME;
        if (sDataLocation === undefined) {
            throw new Error(`environment variable not set : DATA_HOME}`);
        }
        const sBasePath = expandPath(sDataLocation);
        debugServer('initializing data directory %s', sBasePath);
        await this.fsHelper.mkdir(sBasePath);
        await this.fsHelper.mkdir(path.join(sBasePath, 'data'));
        await this.fsHelper.mkdir(path.join(sBasePath, 'modules'));
    }

    async initHttpService() {
        const port = parseInt(this.env.SERVER_HTTP_API_PORT ?? '8080');
        debugServer('starting http server');
        return new Promise((resolve) => {
            const app = this.app;

            // Middlewares
            debugServer('init middlewares');
            app.use(bodyParser());
            app.use(scopePerRequest(container));

            // Routes
            // Each route is declared as middleware
            // and receive its controller dependencies on construction
            debugServer('init routes');
            app.use(userRoutes(container.resolve('userController')).routes());

            // Start listening
            app.listen(port, '127.0.0.1', () => {
                debugServer('http service is now listening on port %d', port);
                resolve(true);
            });
        });
    }

    async run() {
        await this.initDataDirectory();
        await this.initHttpService();
    }
}
