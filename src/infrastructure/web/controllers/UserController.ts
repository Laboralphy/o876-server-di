import { Context } from 'koa';
import { CreateUser } from '../../../application/use-cases/users/CreateUser';
import { CreateUserDto, CreateUserDtoSchema } from '../../../application/dto/CreateUserDto';
import { Cradle } from '../../../config/container';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { HttpStatus } from '../../../domain/enums';
import { ModifyUser } from '../../../application/use-cases/users/ModifyUser';
import { ModifyUserDto, ModifyUserDtoSchema } from '../../../application/dto/ModifyUserDto';
import { PostUserDto, PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDto, PatchUserDtoSchema } from '../dto/PatchUserDto';

export class UserController {
    private readonly createUser: CreateUser;
    private readonly getUserList: GetUserList;
    private readonly modifyUser: ModifyUser;

    constructor({ createUser, getUserList, modifyUser }: Cradle) {
        this.createUser = createUser;
        this.getUserList = getUserList;
        this.modifyUser = modifyUser;
    }

    async create(ctx: Context): Promise<void> {
        const dto: PostUserDto = PostUserDtoSchema.parse(ctx.request.body);
        const user = await this.createUser.execute({
            name: dto.name,
            password: dto.password,
            email: dto.email,
        });
        ctx.status = HttpStatus.CREATED;
        ctx.body = { data: user };
    }

    async getList(ctx: Context): Promise<void> {
        const users = await this.getUserList.execute();
        ctx.status = HttpStatus.OK;
        ctx.body = { data: users };
    }

    async modify(ctx: Context): Promise<void> {
        const dto: PatchUserDto = PatchUserDtoSchema.parse(ctx.request.body);
        const user = await this.modifyUser.execute(dto.id, {
            password: dto.password,
            email: dto.email,
        });
        ctx.status = HttpStatus.CREATED;
        ctx.body = { data: user };
    }
}
