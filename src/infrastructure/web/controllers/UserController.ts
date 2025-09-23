import { Context } from 'koa';
import { CreateUser } from '../../../application/use-cases/users/CreateUser';
import { CreateUserDto, CreateUserDtoSchema } from '../../../application/dto/CreateUserDto';
import { Cradle } from '../../../config/container';

export class UserController {
    private readonly createUser: CreateUser;

    constructor({ createUser }: Cradle) {
        this.createUser = createUser;
    }

    async create(ctx: Context): Promise<void> {
        const dto: CreateUserDto = CreateUserDtoSchema.parse(ctx.request.body);
        const user = await this.createUser.execute(dto);
        ctx.status = 201;
        ctx.body = { user: user.id };
    }

    async getList(ctx: Context): Promise<void> {
        ctx.status = 200;
        ctx.body = { users: [] };
    }
}
