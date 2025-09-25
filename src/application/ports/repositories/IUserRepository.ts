import { User } from '../../../domain/entities/User';
import { IRepository } from './IRepository';

export interface IUserRepository extends IRepository<User> {
    findByName(name: string): Promise<User | undefined>;
}
