import { UserController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import Router from '@koa/router';
import { PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDtoSchema } from '../dto/PatchUserDto';

export function userRoutes(userController: UserController): Router {
    const router = new Router({ prefix: '/users' });

    router.get('/name/:name', (ctx) => userController.findByName(ctx));
    router.get('/', (ctx) => userController.getList(ctx));

    router.post('/', validate(PostUserDtoSchema), (ctx) => userController.create(ctx));

    router.patch('/:id', validate(PatchUserDtoSchema), (ctx) => userController.modify(ctx));

    router.delete('/:id', (ctx) => userController.delete(ctx));

    return router;
}
