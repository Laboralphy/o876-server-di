import { UserController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import { CreateUserDtoSchema } from '../../../application/dto/CreateUserDto';
import Router from '@koa/router';

export function userRoutes(userController: UserController): Router {
    const router = new Router({ prefix: '/users' });

    router.post(
        '/',
        validate(CreateUserDtoSchema), // Middleware de validation
        (ctx) => userController.create(ctx)
    );

    return router;
}
