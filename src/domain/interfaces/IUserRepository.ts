import { User } from '../entities/User';

export interface IUserRepository {
    getUserById(id: string): User | undefined;
    getUserByName(name: string): User | undefined;
}
