import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { User } from '../src/domain/entities/User';
import { GetUser } from '../src/application/use-cases/users/GetUser';

describe('GetUser', () => {
    let container: AwilixContainer<any>;
    beforeEach(() => {
        container = createContainer();
        container.register({
            userRepository: asValue({
                get(id: string): Promise<User | undefined> {
                    return Promise.resolve(
                        id == '1'
                            ? {
                                  id,
                                  name: 'ralphy',
                                  displayName: 'Ralphy',
                                  ban: null,
                                  roles: [],
                                  tsLastUsed: 1000000,
                                  tsCreation: 1000000,
                                  email: 'ralphy@localhost.com',
                              }
                            : undefined
                    );
                },
            }),
            getUser: asClass(GetUser).singleton(),
        });
    });

    it('should return user ralphy when specifying 1', async () => {
        const getUser = container.resolve<GetUser>('getUser');
        await expect(getUser.execute('1')).resolves.toEqual({
            id: '1',
            name: 'ralphy',
            displayName: 'Ralphy',
            ban: null,
            roles: [],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'ralphy@localhost.com',
        });
    });
    it('should return user undefined when specifying other than 1', async () => {
        const getUser = container.resolve<GetUser>('getUser');
        await expect(getUser.execute('2')).resolves.toBeUndefined();
    });
});
