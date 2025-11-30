import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { User } from '../src/domain/entities/User';
import { GetUser } from '../src/application/use-cases/users/GetUser';
import { ROLES } from '../src/domain/enums/roles';
import { ModifyUser } from '../src/application/use-cases/users/ModifyUser';

describe('ModifyUser', () => {
    let container: AwilixContainer<any>;
    beforeEach(() => {
        container = createContainer();
        const users = new Map<string, User>();
        users.set('1', {
            id: '1',
            name: 'ralphy',
            displayName: 'Ralphy',
            ban: null,
            roles: [],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'ralphy@localhost.com',
        });
        users.set('2', {
            id: '2',
            name: 'bob',
            displayName: 'Bob',
            ban: null,
            roles: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.GAME_MASTER],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'ralphy@localhost.com',
        });
        container.register({
            userRepository: asValue({
                async get(id: string): Promise<User | undefined> {
                    const u = users.get(id);
                    if (u) {
                        return { ...u };
                    } else {
                        return undefined;
                    }
                },
                async save(u: User): Promise<void> {
                    users.set(u.id, u);
                },
                async findByDisplayName(displayName: string): Promise<User | undefined> {
                    return Promise.resolve(
                        Array.from(users.values()).find((user) => user.displayName === displayName)
                    );
                },
                async findByName(name: string): Promise<User | undefined> {
                    return Promise.resolve(
                        Array.from(users.values()).find((user) => user.name === name)
                    );
                },
            }),
            modifyUser: asClass(ModifyUser).singleton(),
            getUser: asClass(GetUser).singleton(),
        });
    });
    it('should add a new role to user 1', async () => {
        const modifyUser = container.resolve<ModifyUser>('modifyUser');
        const getUser = container.resolve<GetUser>('getUser');
        const u0 = await getUser.execute('1');
        const u1 = await modifyUser.execute('1', { roles: [ROLES.MODERATOR] });
        const u2 = await getUser.execute('1');
        expect(u0?.roles).toEqual([]);
        expect(u1.roles).toEqual([ROLES.MODERATOR]);
        expect(u2?.roles).toEqual([ROLES.MODERATOR]);
    });
    describe('when modifying user 1 properties', () => {
        it('should throw an error when displayname is not valid', async () => {
            const modifyUser = container.resolve<ModifyUser>('modifyUser');
            await expect(async () => {
                await modifyUser.execute('1', { displayName: '' });
            }).rejects.toThrow();
            await expect(async () => {
                await modifyUser.execute('1', { displayName: 'az' });
            }).rejects.toThrow();
            await expect(async () => {
                await modifyUser.execute('1', { displayName: '1aze' });
            }).rejects.toThrow();
            await expect(async () => {
                await modifyUser.execute('1', { displayName: 'Albator-LXXXIV-' });
            }).rejects.toThrow();
        });
        it('should now throw an error when displayname is valid', async () => {
            const modifyUser = container.resolve<ModifyUser>('modifyUser');
            await expect(async () => {
                await modifyUser.execute('1', { displayName: 'Albator-LXXXIV' });
            }).rejects.not.toThrow();
        });
    });
    it('should remove a new role to user 1', async () => {
        const modifyUser = container.resolve<ModifyUser>('modifyUser');
        const getUser = container.resolve<GetUser>('getUser');
        const u0 = await getUser.execute('1');
        const u1 = await modifyUser.execute('1', { roles: [ROLES.MODERATOR] });
        const u2 = await getUser.execute('1');
        expect(u0?.roles).toEqual([]);
        expect(u1.roles).toEqual([ROLES.MODERATOR]);
        expect(u2?.roles).toEqual([ROLES.MODERATOR]);
    });
});
