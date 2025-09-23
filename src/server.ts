import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { userRoutes } from './infrastructure/web/routes/user.routes';
import { container } from './config/container';
import { scopePerRequest } from 'awilix-koa';

export class Server {
    private readonly app: Koa;

    constructor() {
        this.app = new Koa();
    }

    async run() {
        return new Promise((resolve) => {
            const app = this.app;
            app.use(bodyParser());
            app.use(userRoutes(container.resolve('userController')).routes());
            app.use(scopePerRequest(container));
            app.listen(3000, '127.0.0.1', () => resolve(true));
        });
    }
}
