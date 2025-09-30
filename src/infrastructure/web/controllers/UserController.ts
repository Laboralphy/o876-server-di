import { Context } from 'koa';
import { CreateUser } from '../../../application/use-cases/users/CreateUser';
import { Cradle } from '../../../config/container';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { HttpStatus } from '../../../domain/enums';
import { ModifyUser } from '../../../application/use-cases/users/ModifyUser';
import { PostUserDto, PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDto, PatchUserDtoSchema } from '../dto/PatchUserDto';
import { FindUser } from '../../../application/use-cases/users/FindUser';
import { DeleteUser } from '../../../application/use-cases/users/DeleteUser';
import { GetUserBan } from '../../../application/use-cases/users/GetUserBan';
import { PutUserPasswordDto, PutUserPasswordDtoSchema } from '../dto/PutUserPasswordDto';
import { SetUserPassword } from '../../../application/use-cases/users/SetUserPassword';
import { GetUserInfoDto, GetUserInfoDtoSchema } from '../dto/GetUserInfoDto';
import { ITime } from '../../../application/ports/services/ITime';
import { GetUser } from '../../../application/use-cases/users/GetUser';

export class UserController {
    private readonly createUser: CreateUser;
    private readonly getUserList: GetUserList;
    private readonly modifyUser: ModifyUser;
    private readonly findUser: FindUser;
    private readonly deleteUser: DeleteUser;
    private readonly getUserBan: GetUserBan;
    private readonly getUser: GetUser;
    private readonly setUserPassword: SetUserPassword;
    private readonly time: ITime;

    constructor(cradle: Cradle) {
        this.createUser = cradle.createUser;
        this.getUserList = cradle.getUserList;
        this.modifyUser = cradle.modifyUser;
        this.findUser = cradle.findUser;
        this.deleteUser = cradle.deleteUser;
        this.getUserBan = cradle.getUserBan;
        this.getUser = cradle.getUser;
        this.setUserPassword = cradle.setUserPassword;
        this.time = cradle.time;
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
            email: dto.email,
        });
        ctx.status = HttpStatus.CREATED;
        ctx.body = { data: user };
    }

    async setPassword(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const dto: PutUserPasswordDto = PutUserPasswordDtoSchema.parse(ctx.request.body);
        await this.setUserPassword.execute(idUser, dto.password);
        ctx.status = HttpStatus.OK;
    }

    async delete(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        await this.deleteUser.execute(idUser);
        ctx.status = HttpStatus.NO_CONTENT;
    }

    async getInfo(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const user = await this.getUser.execute(idUser);
        const userBan = await this.getUserBan.execute(idUser);
        if (!user) {
            ctx.status = HttpStatus.NOT_FOUND;
            return;
        }
        if (userBan) {
            const bannedByUser = await this.getUser.execute(userBan.bannedBy);
            ctx.status = HttpStatus.OK;
            ctx.body = {
                data: GetUserInfoDtoSchema.parse({
                    id: idUser,
                    name: user.name,
                    email: user.email,
                    since: this.time.renderDate(user.tsCreation, 'ymd'),
                    connected: false,
                    ban: {
                        bannedBy: bannedByUser?.name ?? '[admin or deleted user]',
                        reason: userBan.reason,
                        duration: userBan.forever
                            ? 'forever'
                            : this.time.renderDuration(this.time.now() - userBan.tsEnd),
                    },
                }),
            };
        } else {
            ctx.status = HttpStatus.OK;
            ctx.body = {
                data: GetUserInfoDtoSchema.parse({
                    id: idUser,
                    name: user.name,
                    email: user.email,
                    since: this.time.renderDate(user.tsCreation, 'ymd'),
                    connected: false,
                    ban: null,
                }),
            };
        }
    }
}
