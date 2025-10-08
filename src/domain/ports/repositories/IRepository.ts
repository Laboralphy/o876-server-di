import { ForEachCallback } from '../adapters/IDatabaseAdapter';

/**
 * This is the base repository interface for low level entity access
 */
export interface IRepository<T> {
    save(entity: T): Promise<T>;
    delete(entity: T): Promise<void>;
    get(key: string): Promise<T | undefined>;
    forEach(callback: ForEachCallback<T>): Promise<void>;
}
