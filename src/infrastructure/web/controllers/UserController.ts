import { Context } from 'koa';
import { CreateUser } from '../../../application/use-cases/users/CreateUser';
import { Cradle } from '../../../boot/container';
import { GetUserList } from '../../../application/use-cases/users/GetUserList';
import { HTTP_STATUS } from '../../../domain/enums/http-status';
import { ModifyUser } from '../../../application/use-cases/users/ModifyUser';
import { PostUserDto, PostUserDtoSchema } from '../dto/PostUserDto';
import { PatchUserDto, PatchUserDtoSchema } from '../dto/PatchUserDto';
import { FindUser } from '../../../application/use-cases/users/FindUser';
import { DeleteUser } from '../../../application/use-cases/users/DeleteUser';
import { GetUserBan } from '../../../application/use-cases/users/GetUserBan';
import { PutUserPasswordDto, PutUserPasswordDtoSchema } from '../dto/PutUserPasswordDto';
import { SetUserPassword } from '../../../application/use-cases/user-secrets/SetUserPassword';
import { ITime } from '../../../application/ports/services/ITime';
import { GetUser } from '../../../application/use-cases/users/GetUser';
import { PutUserBanDto, PutUserBanDtoSchema } from '../dto/PutUserBanDto';
import { BanUser } from '../../../application/use-cases/users/BanUser';
import { UnbanUser } from '../../../application/use-cases/users/UnbanUser';
import { GetUserInfoDtoSchema } from '../dto/GetUserInfoDto';

export class UserController {
    private readonly createUser: CreateUser;
    private readonly getUserList: GetUserList;
    private readonly modifyUser: ModifyUser;
    private readonly findUser: FindUser;
    private readonly deleteUser: DeleteUser;
    private readonly getUserBan: GetUserBan;
    private readonly getUser: GetUser;
    private readonly setUserPassword: SetUserPassword;
    private readonly banUser: BanUser;
    private readonly unbanUser: UnbanUser;
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
        this.banUser = cradle.banUser;
        this.unbanUser = cradle.unbanUser;
        this.time = cradle.time;
    }

    async create(ctx: Context): Promise<void> {
        const dto: PostUserDto = PostUserDtoSchema.parse(ctx.request.body);
        const user = await this.createUser.execute({
            name: dto.name,
            password: dto.password,
            email: dto.email,
            displayName: dto.displayName,
        });
        ctx.status = HTTP_STATUS.CREATED;
        ctx.body = user;
    }

    async getList(ctx: Context): Promise<void> {
        const users = await this.getUserList.execute();
        ctx.status = HTTP_STATUS.OK;
        ctx.body = users;
    }

    async findByName(ctx: Context): Promise<void> {
        const user = await this.findUser.execute({ name: ctx.params.name });
        if (user) {
            ctx.status = HTTP_STATUS.OK;
            ctx.body = user;
        } else {
            ctx.status = HTTP_STATUS.NOT_FOUND;
        }
    }

    async modify(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const dto: PatchUserDto = PatchUserDtoSchema.parse(ctx.request.body);
        const user = await this.modifyUser.execute(idUser, {
            email: dto.email,
            displayName: dto.displayName,
            roles: dto.roles,
        });
        ctx.status = HTTP_STATUS.CREATED;
        ctx.body = user;
    }

    async ban(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const dto: PutUserBanDto = PutUserBanDtoSchema.parse(ctx.request.body);
        const duration = dto.forever
            ? Infinity
            : dto.duration
              ? this.time.convertToMilliseconds(dto?.duration)
              : 0;
        await this.banUser.execute(idUser, {
            reason: dto.reason,
            duration,
            bannedBy: '',
        });
        ctx.status = HTTP_STATUS.NO_CONTENT;
    }

    async unban(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        await this.unbanUser.execute(idUser);
        ctx.status = HTTP_STATUS.NO_CONTENT;
    }

    async setPassword(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const dto: PutUserPasswordDto = PutUserPasswordDtoSchema.parse(ctx.request.body);
        await this.setUserPassword.execute(idUser, dto.password, '');
        ctx.status = HTTP_STATUS.NO_CONTENT;
    }

    async delete(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        await this.deleteUser.execute(idUser);
        ctx.status = HTTP_STATUS.NO_CONTENT;
    }

    async getInfo(ctx: Context): Promise<void> {
        const idUser = ctx.params.id;
        const user = await this.getUser.execute(idUser);
        const userBan = await this.getUserBan.execute(idUser);
        if (!user) {
            ctx.status = HTTP_STATUS.NOT_FOUND;
            return;
        }
        if (userBan) {
            const bannedByUser = userBan.bannedBy
                ? await this.getUser.execute(userBan.bannedBy)
                : null;
            ctx.status = HTTP_STATUS.OK;
            ctx.body = GetUserInfoDtoSchema.parse({
                id: idUser,
                name: user.name,
                email: user.email,
                created: this.time.renderDate(user.tsCreation, 'ymd'),
                connected: false,
                roles: user.roles.map((r) => r.toString()),
                ban: {
                    bannedBy: bannedByUser?.name ?? '[admin or deleted user]',
                    reason: userBan.reason,
                    since: this.time.renderDate(userBan.tsBegin, 'ymd hm'),
                    until: userBan.forever
                        ? 'the end of time'
                        : this.time.renderDate(userBan.tsEnd, 'ymd hm'),
                },
            });
        } else {
            ctx.status = HTTP_STATUS.OK;
            ctx.body = GetUserInfoDtoSchema.parse({
                id: idUser,
                name: user.name,
                email: user.email,
                created: this.time.renderDate(user.tsCreation, 'ymd'),
                connected: false,
                roles: user.roles.map((r) => r.toString()),
                ban: null,
            });
        }
    }
}
