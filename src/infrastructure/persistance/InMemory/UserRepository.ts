import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
    private _users: Map<string, User> = new Map<string, User>();

    async save(user: User): Promise<User> {
        this._users.set(user.id, user);
        return user;
    }

    async delete(user: User): Promise<void> {
        this._users.delete(user.id);
    }

    async get(id: string): Promise<User | undefined> {
        return this._users.get(id);
    }

    async findByName(name: string): Promise<User | undefined> {
        for (const user of this._users.values()) {
            if (user.name === name) {
                return user;
            }
        }
        return undefined;
    }
}
