import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
    private _users: Map<string, User> = new Map<string, User>();

    getUserById(id: string): User | undefined {
        return this._users.get(id);
    }

    getUserByName(name: string): User | undefined {
        for (const user of this._users.values()) {
            if (user.name === name) {
                return user;
            }
        }
        return undefined;
    }
}
