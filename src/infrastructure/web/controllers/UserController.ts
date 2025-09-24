import { Context } from 'koa';
import { CreateUser } from '../../../application/use-cases/users/CreateUser';
import { CreateUserDto, CreateUserDtoSchema } from '../../../application/dto/CreateUserDto';
import { Cradle } from '../../../config/container';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { HttpStatus } from '../../../domain/enums';

export class UserController {
    private readonly createUser: CreateUser;
    private readonly getUserList: GetUserList;

    constructor({ createUser, getUserList }: Cradle) {
        this.createUser = createUser;
        this.getUserList = getUserList;
    }

    async create(ctx: Context): Promise<void> {
        const dto: CreateUserDto = CreateUserDtoSchema.parse(ctx.request.body);
        const user = await this.createUser.execute(dto);
        ctx.status = HttpStatus.CREATED;
        ctx.body = { data: user.id };
    }

    async getList(ctx: Context): Promise<void> {
        const users = await this.getUserList.execute();
        ctx.status = HttpStatus.OK;
        ctx.body = { data: users };
    }
}
