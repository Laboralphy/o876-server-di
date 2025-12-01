import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { MailMessage } from '../src/domain/entities/MailMessage';
import { MailInbox } from '../src/domain/entities/MailInbox';
import { UIDGenerator } from '../src/infrastructure/services/UIDGenerator';
import { User } from '../src/domain/entities/User';
import { SetMailFlags } from '../src/application/use-cases/mail/SetMailFlags';
import { CheckMailInbox } from '../src/application/use-cases/mail/CheckMailInbox';

describe('SetMailFlags', () => {
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
            setMailFlags: asClass(SetMailFlags).singleton(),
            checkMailInbox: asClass(CheckMailInbox).singleton(),
        });
    });
    it('deleted message should not appear in mailbox list', async () => {
        // create message
        const m1: MailMessage = {
            id: '1',
            tsCreation: currentDate.getTime(),
            topic: 'Topic1',
            content: 'xxxxx',
            senderId: '1',
            recipientIds: ['2'],
        };
        const mib1: MailInbox = {
            userId: '2',
            messageId: '1',
            tsReceived: currentDate.getTime(),
            tag: 1,
            read: false,
            kept: false,
            deleted: false,
        };
        mailMessages.set('1', m1);
        mailInboxes.set('2-1', mib1);
        const checkMailInbox = container.resolve<CheckMailInbox>('checkMailInbox');
        const setMailFlags = container.resolve<SetMailFlags>('setMailFlags');
        const mibList1 = await checkMailInbox.execute('2');
        expect(mibList1.length).toBe(1);
        await setMailFlags.execute('2-1', { deleted: true });
        const mibList2 = await checkMailInbox.execute('2');
        expect(mibList2.length).toBe(0);
    });
    it('pinned message should be displayed first', async () => {
        // create message
        currentDate.setTime(new Date('2024-12-01T18:00:00.000Z').getTime());
        const m1: MailMessage = {
            id: '1',
            tsCreation: currentDate.getTime() - 1000000,
            topic: 'Topic1',
            content: 'xxxxx',
            senderId: '1',
            recipientIds: ['2'],
        };
        const m2: MailMessage = {
            id: '2',
            tsCreation: currentDate.getTime() - 500000,
            topic: 'Topic2',
            content: 'xxxxx',
            senderId: '1',
            recipientIds: ['2'],
        };
        const mib1: MailInbox = {
            userId: '2',
            messageId: '1',
            tsReceived: m1.tsCreation,
            tag: 1,
            read: false,
            kept: false,
            deleted: false,
        };
        const mib2: MailInbox = {
            userId: '2',
            messageId: '2',
            tsReceived: m2.tsCreation,
            tag: 2,
            read: false,
            kept: false,
            deleted: false,
        };
        mailMessages.set('1', m1);
        mailMessages.set('2', m2);
        mailInboxes.set('2-1', mib1);
        mailInboxes.set('2-2', mib2);
        const checkMailInbox = container.resolve<CheckMailInbox>('checkMailInbox');
        const mibList0 = await checkMailInbox.execute('2');
        console.log(mibList0);
        // message 0 must be more recent thant message 1
        expect(mibList0[0].date > mibList0[1].date).toBeTruthy();
        // But if message 1 is pinned, it become on top of the list
    });
});
