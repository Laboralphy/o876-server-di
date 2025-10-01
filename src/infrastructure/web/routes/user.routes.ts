import { UserController } from '../controllers/UserController';
import { validate } from '../middlewares/validate';
import Router from '@koa/router';
import { PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDtoSchema } from '../dto/PatchUserDto';
import { PutUserPasswordDtoSchema } from '../dto/PutUserPasswordDto';
import { PutUserBanDtoSchema } from '../dto/PutUserBanDto';

export function userRoutes(userController: UserController): Router {
    const router = new Router({ prefix: '/users' });

    // /:id/something
    router.put('/:id/ban', validate(PutUserBanDtoSchema), (ctx) => userController.ban(ctx));
    router.put('/:id/unban', (ctx) => userController.unban(ctx));
    router.put('/:id/password', validate(PutUserPasswordDtoSchema), (ctx) =>
        userController.setPassword(ctx)
    );

    // /name/:name
    router.get('/name/:name', (ctx) => userController.findByName(ctx));

    // /:id
    router.get('/:id', async (ctx) => userController.getInfo(ctx));
    router.delete('/:id', (ctx) => userController.delete(ctx));
    router.patch('/:id', validate(PatchUserDtoSchema), (ctx) => userController.modify(ctx));

    // /
    router.post('/', validate(PostUserDtoSchema), (ctx) => userController.create(ctx));
    router.get('/', (ctx) => userController.getList(ctx));

    return router;
}
