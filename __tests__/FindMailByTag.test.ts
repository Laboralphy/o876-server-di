import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { MailMessage } from '../src/domain/entities/MailMessage';
import { MailInbox } from '../src/domain/entities/MailInbox';
import { UIDGenerator } from '../src/infrastructure/services/UIDGenerator';
import { User } from '../src/domain/entities/User';
import { SetMailFlags } from '../src/application/use-cases/mail/SetMailFlags';
import { CheckMailInbox } from '../src/application/use-cases/mail/CheckMailInbox';
import { FindMailByTag } from '../src/application/use-cases/mail/FindMailByTag';

describe('FindMailByTag', () => {
    const currentDate: Date = new Date();
    let container: AwilixContainer<any>;
    const mailMessages: Map<string, MailMessage> = new Map<string, MailMessage>();
    const mailInboxes: Map<string, MailInbox> = new Map<string, MailInbox>();
    beforeEach(() => {
        // mailInboxRepository
        // mailMessageRepository
        // userRepository
        // time
        // serverConfig
        // idGenerator
        mailMessages.clear();
        mailInboxes.clear();
        container = createContainer();
        container.register({
            time: asValue({
                now: () => currentDate.getTime(),
                renderDate: (d: Date) => new Date(d).toISOString(),
                renderDuration: () => '',
                convertToMilliseconds: () => 0,
            }),
            serverConfig: asValue({
                getVariables: () => {
                    return {
                        mailMaxExpirationDays: 30,
                    };
                },
            }),
            idGenerator: asClass(UIDGenerator).singleton(),
            userRepository: asValue({
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
            }),
            mailMessageRepository: asValue({
                save: async (message: MailMessage) => {
                    mailMessages.set(message.id, message);
                },
                get: async (id: string): Promise<MailMessage | undefined> => {
                    const r = mailMessages.get(id);
                    if (r) {
                        return { ...r };
                    } else {
                        return r;
                    }
                },
            }),
            mailInboxRepository: asValue({
                save: async (mib: MailInbox) => {
                    mailInboxes.set(mib.userId + '-' + mib.messageId, mib);
                },
                findByUserId: async (userId: string) => {
                    return Array.from(mailInboxes.values())
                        .filter((mib: MailInbox) => mib.userId === userId)
                        .map((r) => ({ ...r }));
                },
                get: async (id: string): Promise<MailInbox | undefined> => {
                    const r = mailInboxes.get(id);
                    if (r) {
                        return { ...r };
                    } else {
                        return r;
                    }
                },
                delete: async (id: string): Promise<void> => {
                    mailInboxes.delete(id);
                },
            }),
            findMailByTag: asClass(FindMailByTag).singleton(),
        });
    });
    it('deleted message should not appear in mailbox list', async () => {
        // create message
        const m1: MailMessage = {
            id: '1',
            tsCreation: currentDate.getTime() - 100000,
            topic: 'Topic1',
            content: 'xxxxx 1',
            senderId: '1',
            recipientIds: ['2'],
        };
        const m2: MailMessage = {
            id: '2',
            tsCreation: currentDate.getTime() - 90000,
            topic: 'Topic2',
            content: 'xxxxx 2',
            senderId: '1',
            recipientIds: ['2'],
        };
        const m3: MailMessage = {
            id: '3',
            tsCreation: currentDate.getTime() - 80000,
            topic: 'Topic3',
            content: 'xxxxx 3',
            senderId: '1',
            recipientIds: ['2'],
        };
        const mib1: MailInbox = {
            userId: '2',
            messageId: '1',
            tsReceived: m1.tsCreation,
            tag: 1,
            read: false,
            pinned: false,
            deleted: false,
        };
        const mib2: MailInbox = {
            userId: '2',
            messageId: '2',
            tsReceived: m2.tsCreation,
            tag: 2,
            read: false,
            pinned: false,
            deleted: false,
        };
        const mib3: MailInbox = {
            userId: '2',
            messageId: '3',
            tsReceived: m3.tsCreation,
            tag: 3,
            read: false,
            pinned: false,
            deleted: false,
        };
        mailMessages.set('1', m1);
        mailMessages.set('2', m2);
        mailMessages.set('3', m3);
        mailInboxes.set('2-1', mib1);
        mailInboxes.set('2-2', mib2);
        mailInboxes.set('2-3', mib3);
        const findMailByTag = container.resolve<FindMailByTag>('findMailByTag');
        const f1 = await findMailByTag.execute('2', 1);
        const f2 = await findMailByTag.execute('2', 2);
        const f3 = await findMailByTag.execute('2', 3);
        await expect(findMailByTag.execute('2', 4)).rejects.toThrow(
            'ENTITY_NOT_FOUND tag "4" for user 2'
        );
        expect(f1).toBeDefined();
        expect(f2).toBeDefined();
        expect(f3).toBeDefined();
        expect(f1?.topic).toBe('Topic1');
        expect(f2?.topic).toBe('Topic2');
        expect(f3?.topic).toBe('Topic3');
        expect(f1?.body).toBe('xxxxx 1');
        expect(f2?.body).toBe('xxxxx 2');
        expect(f3?.body).toBe('xxxxx 3');
    });
});
