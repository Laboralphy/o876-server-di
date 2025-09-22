import { User } from '../../../domain/entities/User';

export interface IUserRepository {
    save(user: User): Promise<User>;
    delete(user: User): Promise<void>;
    get(id: string): Promise<User | undefined>;
    findByName(name: string): Promise<User | undefined>;
}
