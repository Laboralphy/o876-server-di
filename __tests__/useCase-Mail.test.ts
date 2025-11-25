import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { UIDGenerator } from '../src/infrastructure/services/UIDGenerator';
import { User } from '../src/domain/entities/User';

describe('UseCase Mail', () => {
    const currentDate: Date = new Date();
    let container: AwilixContainer<any>;
    beforeEach(() => {
        // mailInboxRepository
        // mailMessageRepository
        // userRepository
        // time
        // serverConfig
        // idGenerator
        container = createContainer();
        container.register({
            time: asValue({
                now: currentDate.getTime(),
                renderDate: 'xx-xx-xx',
                renderDuration: '',
                convertToMilliseconds: 0,
            }),
            serverConfig: {
                getVariables: () => {
                    return {
                        mailMaxExpirationDays: 30,
                    };
                },
            },
            idGenerator: asClass(UIDGenerator).singleton,
            userRepository: {
                get: (id: string): User | undefined => {
                    if (id == '1') {
                        return {
                            id: '1',
                            name: 'ralphy',
                            displayName: 'Ralphy',
                            ban: null,
                            roles: [],
                            tsLastUsed: 1000000,
                            tsCreation: 1000000,
                            email: 'ralphy@localhost.com',
                        };
                    } else if (id == '2') {
                        return {
                            id: '2',
                            name: 'bob',
                            displayName: 'Bob',
                            ban: null,
                            roles: [],
                            tsLastUsed: 1000000,
                            tsCreation: 1000000,
                            email: 'boby@localhost.com',
                        };
                    } else if (id == '3') {
                        return {
                            id: '3',
                            name: 'alice',
                            displayName: 'Alice',
                            ban: null,
                            roles: [],
                            tsLastUsed: 1000000,
                            tsCreation: 1000000,
                            email: 'alice@localhost.com',
                        };
                    } else {
                        return undefined;
                    }
                },
            },
            mailMessageRepository:
        });
    });
});
