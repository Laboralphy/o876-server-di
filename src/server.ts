import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './infrastructure/web/routes/user.routes';
import { container } from './config/container';
import { scopePerRequest } from 'awilix-koa';
import { printDbg } from './libs/print-dbg';

const debugServer = printDbg('server');

export class Server {
    private readonly app: Koa;

    constructor() {
        this.app = new Koa();
    }

    async initHttpService() {
        const port = 3000;
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
        await this.initHttpService();
    }
}
