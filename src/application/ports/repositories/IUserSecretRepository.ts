import { IRepository } from './IRepository';
import { UserSecret } from '../../../domain/entities/UserSecret';

export interface IUserSecretRepository extends IRepository<UserSecret> {}
