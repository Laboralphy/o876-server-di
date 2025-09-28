import { UserController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import Router from '@koa/router';
import { PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDtoSchema } from '../dto/PatchUserDto';

export function userRoutes(userController: UserController): Router {
    const router = new Router({ prefix: '/users' });

    router.get('/', (ctx) => userController.getList(ctx));

    router.post('/', validate(PostUserDtoSchema), (ctx) => userController.create(ctx));

    router.patch('/', validate(PatchUserDtoSchema), (ctx) => userController.modify(ctx));

    return router;
}
