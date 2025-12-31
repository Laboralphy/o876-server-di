import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { User } from '../src/domain/entities/User';
import { ROLES } from '../src/domain/enums/roles';
import { MailMessage } from '../src/domain/entities/MailMessage';
import { ServerConfigOptions } from '../src/domain/types/ServerConfig';
import { ReadMail } from '../src/application/use-cases/mail/ReadMail';

describe('ReadMail', () => {
    let container: AwilixContainer<any>;
    const currentDate = new Date();
    const mailMessages = new Map<string, MailMessage>();
    const users = new Map<string, User>();
    beforeEach(() => {
        currentDate.setTime(Date.now());
        container = createContainer();
        users.clear();
        users.set('a', {
            id: 'a',
            name: 'alice',
            displayName: 'Alice',
            female: true,
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
            female: false,
            ban: null,
            roles: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.GAME_MASTER],
            tsLastUsed: 1000000,
            tsCreation: 1000000,
            email: 'ralphy@localhost.com',
        });
        mailMessages.clear();
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
            mailMessageRepository: asValue({
                async get(id: string): Promise<MailMessage | undefined> {
                    const m = mailMessages.get(id);
                    if (m) {
                        return { ...m };
                    } else {
                        return undefined;
                    }
                },
                async save(m: MailMessage): Promise<void> {
                    mailMessages.set(m.id, m);
                },
                async delete(m: MailMessage): Promise<void> {
                    mailMessages.delete(m.id);
                },
                async findUserMessages(userId: string): Promise<MailMessage[]> {
                    return Array.from(mailMessages.values()).filter(
                        (m) => m.recipientId === userId
                    );
                },
                async findExpiredMessages(ts: number): Promise<MailMessage[]> {
                    return Array.from(mailMessages.values()).filter((m) => m.tsSent <= ts);
                },
            }),
            time: asValue({
                now: () => currentDate.getTime(),
            }),
            serverConfig: asValue({
                getVariables(): ServerConfigOptions {
                    return {
                        name: 'sdi',
                        author: 'ralphy',
                        license: 'mit',
                        description: 'none',
                        version: '1.0.1',
                        loginNewUser: 'new',
                        mailMaxExpirationDays: 30,
                        mailMaxMessageLength: 2000,
                    };
                },
            }),
            readMail: asClass(ReadMail).singleton(),
        });
    });

    it('should read mail from alice to bob, and should delete message after', async () => {
        mailMessages.set('100', {
            id: '100',
            tsSent: currentDate.getTime(),
            recipientId: 'b',
            senderId: 'a',
            content: 'message from alice to bob',
        });
        expect(mailMessages.size).toBe(1);
        const readMail = container.resolve<ReadMail>('readMail');
        const x = await readMail.execute('b');
        expect(x).toBeDefined();
        if (x) {
            expect(x.message).toBe('message from alice to bob');
        }
        expect(mailMessages.size).toBe(0);
    });

    it('should delete old mails prior to read mails', async () => {
        mailMessages.set('100', {
            id: '100',
            tsSent: currentDate.getTime() - 50 * 24 * 3600 * 1000,
            recipientId: 'b',
            senderId: 'a',
            content: 'this mail from alice to bob will be deleted because too old (50 days)',
        });
        mailMessages.set('101', {
            id: '101',
            tsSent: currentDate.getTime(),
            recipientId: 'b',
            senderId: 'a',
            content: 'message from alice to bob',
        });
        expect(mailMessages.size).toBe(2);
        const readMail = container.resolve<ReadMail>('readMail');
        const x = await readMail.execute('b');
        expect(x).toBeDefined();
        if (x) {
            expect(x.message).toBe('message from alice to bob');
        }
        expect(mailMessages.size).toBe(0);
        const x2 = await readMail.execute('b');
        expect(x2).toBeUndefined();
    });

    it('should read mail from alice to bob, ordered by timestamp', async () => {
        mailMessages.set('100', {
            id: '100',
            tsSent: currentDate.getTime() - 60 * 1000,
            recipientId: 'b',
            senderId: 'a',
            content: 'older message from alice to bob',
        });
        mailMessages.set('101', {
            id: '101',
            tsSent: currentDate.getTime(),
            recipientId: 'b',
            senderId: 'a',
            content: 'new message from alice to bob',
        });
        const readMail = container.resolve<ReadMail>('readMail');
        const x1 = await readMail.execute('b');
        expect(x1).toBeDefined();
        if (x1) {
            expect(x1.message).toBe('older message from alice to bob');
            expect(x1.remaining).toBe(1);
        }
        const x2 = await readMail.execute('b');
        expect(x2).toBeDefined();
        if (x2) {
            expect(x2.message).toBe('new message from alice to bob');
            expect(x2.remaining).toBe(0);
        }
        const x3 = await readMail.execute('b');
        expect(x3).toBeUndefined();
    });
});
