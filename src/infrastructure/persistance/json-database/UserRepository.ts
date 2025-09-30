import { User, UserSchema } from '../../../domain/entities/User';
import { IUserRepository } from '../../../application/ports/repositories/IUserRepository';
import { Cradle } from '../../../config/container';
import { ForEachCallback, IDatabaseAdapter } from '../../../domain/ports/IDatabaseAdapter';

const COLLECTION_NAME = 'users';

export class UserRepository implements IUserRepository {
    private readonly database: IDatabaseAdapter;

    constructor({ database }: Cradle) {
        this.database = database;
    }

    async save(user: User): Promise<User> {
        await this.database.store(COLLECTION_NAME, user.id, user);
        return user;
    }

    async delete(user: User): Promise<void> {
        return this.database.remove(COLLECTION_NAME, user.id);
    }

    async get(id: string): Promise<User | undefined> {
        const data = await this.database.load(COLLECTION_NAME, id);
        if (data) {
            return UserSchema.parse(data);
        } else {
            return undefined;
        }
    }

    async forEach(callback: ForEachCallback<any>): Promise<void> {
        await this.database.forEach(COLLECTION_NAME, callback);
    }

    async findByName(name: string): Promise<User | undefined> {
        const aUsers = await this.database.find(COLLECTION_NAME, { name });
        if (aUsers.length > 0) {
            return UserSchema.parse(aUsers.shift());
        } else {
            return undefined;
        }
    }
}
