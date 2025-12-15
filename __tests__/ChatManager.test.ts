import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { ChatManager } from '../src/infrastructure/services/ChatManager';
import { SendUserMessage } from '../src/application/use-cases/users/SendUserMessage';
import { User } from '../src/domain/entities/User';
import { ROLES } from '../src/domain/enums/roles';

describe('ChatManager', () => {
    let container: AwilixContainer<any>;
    let log: string[] = [];
    const users = new Map<string, User>();

    beforeEach(() => {
        users.clear();
        users.set('a', {
            id: 'a',
            name: 'alice',
            displayName: 'Alice',
            ban: null,
            roles: [],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'alice@localhost.com',
        });
        users.set('b', {
            id: 'b',
            name: 'bob',
            displayName: 'Bob',
            ban: null,
            roles: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.GAME_MASTER],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'ralphy@localhost.com',
        });
        users.set('c', {
            id: 'c',
            name: 'charlie',
            displayName: 'Charlie',
            ban: null,
            roles: [ROLES.ADMIN],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'ralphy@localhost.com',
        });

        container = createContainer();
        log = [];
        container.register({
            sendUserMessage: asValue({
                execute(recv: string, key: string) {
                    log.push(`${recv} ${key}`);
                },
            }),
            chatManager: asClass(ChatManager).singleton(),
        });
    });

    describe('defineChannel', () => {
        it('should not throw error when defining channel', () => {
            const cm = container.resolve<ChatManager>('chatManager');
            expect(() =>
                cm.defineChannel({
                    id: 'trade',
                    tag: '',
                    persistent: true,
                    readonly: false,
                    scoped: false,
                    color: '#999',
                    autojoin: false,
                })
            ).not.toThrow();
        });
    });

    describe('joinChannel', () => {
        it("should log 'a chat.youJoined', 'b chat.youJoined', 'a chat.userJoined' when a join, then b join", () => {
            const cm = container.resolve<ChatManager>('chatManager');
            const alice = users.get('a')!;
            const bob = users.get('b')!;
            cm.registerUser(alice);
            cm.registerUser(bob);
            cm.defineChannel({
                id: 'trade',
                tag: '',
                persistent: true,
                readonly: false,
                scoped: false,
                color: '#999',
                autojoin: false,
            });
            expect(() => cm.joinChannel(alice.id, 'trade')).not.toThrow();
            const au1 = cm.getUserList('trade');
            expect(au1).toEqual(['a']);
            expect(() => cm.joinChannel(bob.id, 'trade')).not.toThrow();
            const au2 = cm.getUserList('trade');
            expect(au2).toEqual(['a', 'b']);
            expect(log).toEqual(['a chat.youJoined', 'b chat.youJoined', 'a chat.userJoined']);
        });

        it('should join only one channel of the same tag at the time', () => {
            const cm = container.resolve<ChatManager>('chatManager');
            const alice = users.get('a')!;
            cm.registerUser(alice);
            cm.defineChannel({
                id: 'team',
                tag: 'team',
                persistent: false,
                readonly: false,
                scoped: true,
                color: '#999',
                autojoin: false,
            });
            cm.defineChannel({
                id: 'trade',
                tag: '',
                persistent: true,
                readonly: false,
                scoped: false,
                color: '#999',
                autojoin: false,
            });
            cm.joinChannel(alice.id, 'team#111');
            expect(cm.getUserList('team#111')).toEqual(['a']);
            cm.joinChannel(alice.id, 'team#222');
            expect(cm.getUserList('team#111')).toEqual([]);
            expect(cm.getUserList('team#222')).toEqual(['a']);
            cm.joinChannel(alice.id, 'trade');
            expect(cm.getUserList('team#111')).toEqual([]);
            expect(cm.getUserList('team#222')).toEqual(['a']);
            expect(cm.getUserList('trade')).toEqual(['a']);
        });
    });
});
