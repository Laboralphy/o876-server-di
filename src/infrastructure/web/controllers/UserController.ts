import { Context } from 'koa';
import { CreateUser } from '../../../application/use-cases/users/CreateUser';
import { Cradle } from '../../../config/container';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { HttpStatus } from '../../../domain/enums';
import { ModifyUser } from '../../../application/use-cases/users/ModifyUser';
import { PostUserDto, PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDto, PatchUserDtoSchema } from '../dto/PatchUserDto';
import { FindUser } from '../../../application/use-cases/users/FindUser';
import { User } from '../../../domain/entities/User';
import { DeleteUser } from '../../../application/use-cases/users/DeleteUser';

export class UserController {
    private readonly createUser: CreateUser;
    private readonly getUserList: GetUserList;
    private readonly modifyUser: ModifyUser;
    private readonly findUser: FindUser;
    private readonly deleteUser: DeleteUser;

    constructor({ createUser, getUserList, modifyUser, findUser, deleteUser }: Cradle) {
        this.createUser = createUser;
        this.getUserList = getUserList;
        this.modifyUser = modifyUser;
        this.findUser = findUser;
        this.deleteUser = deleteUser;
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

    async findByName(ctx: Context): Promise<void> {
        const user = await this.findUser.execute(ctx.params.name);
        if (user) {
            ctx.status = HttpStatus.OK;
            ctx.body = { data: user };
        } else {
            ctx.status = HttpStatus.NOT_FOUND;
        }
    }

    async modify(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const dto: PatchUserDto = PatchUserDtoSchema.parse(ctx.request.body);
        const user = await this.modifyUser.execute(idUser, {
            password: dto.password,
            email: dto.email,
        });
        ctx.status = HttpStatus.CREATED;
        ctx.body = { data: user };
    }

    async delete(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        await this.deleteUser.execute(idUser);
        ctx.status = HttpStatus.NO_CONTENT;
    }
}
