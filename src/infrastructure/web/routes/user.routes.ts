import { UserController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import { CreateUserDtoSchema } from '../../../application/dto/CreateUserDto';
import Router from '@koa/router';

export function userRoutes(userController: UserController): Router {
    const router = new Router({ prefix: '/users' });

    router.get('/', (ctx) => userController.getList(ctx));

    router.post('/', validate(CreateUserDtoSchema), (ctx) => userController.create(ctx));

    return router;
}
