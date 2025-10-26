import { UserSecret, UserSecretSchema } from '../../../domain/entities/UserSecret';
import { Cradle } from '../../../boot/container';
import { ForEachCallback, IDatabaseAdapter } from '../../../domain/ports/adapters/IDatabaseAdapter';
import { IUserSecretRepository } from '../../../domain/ports/repositories/IUserSecretRepository';

const COLLECTION_NAME = 'user-secrets';

export class UserSecretRepository implements IUserSecretRepository {
    private readonly database: IDatabaseAdapter;

    constructor({ database }: Cradle) {
        this.database = database;
    }

    async save(userSecret: UserSecret): Promise<UserSecret> {
        await this.database.store(COLLECTION_NAME, userSecret.id, userSecret);
        return userSecret;
    }

    async delete(userSecret: UserSecret): Promise<void> {
        return this.database.remove(COLLECTION_NAME, userSecret.id);
    }

    async get(id: string): Promise<UserSecret | undefined> {
        const data = await this.database.load(COLLECTION_NAME, id);
        if (data) {
            return UserSecretSchema.parse(data);
        } else {
            return undefined;
        }
    }

    async forEach(callback: ForEachCallback<any>): Promise<void> {
        await this.database.forEach(COLLECTION_NAME, callback);
    }
}
