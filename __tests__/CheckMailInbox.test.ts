import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { MailMessage } from '../src/domain/entities/MailMessage';
import { MailInbox } from '../src/domain/entities/MailInbox';
import { UIDGenerator } from '../src/infrastructure/services/UIDGenerator';
import { User } from '../src/domain/entities/User';
import { CheckMailInbox } from '../src/application/use-cases/mail/CheckMailInbox';

describe('CheckMailInbox', () => {
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
                renderDate: () => 'xx-xx-xx',
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
                    return mailMessages.get(id);
                },
            }),
            mailInboxRepository: asValue({
                save: async (mib: MailInbox) => {
                    mailInboxes.set(mib.userId + '-' + mib.messageId, mib);
                },
                findByUserId: async (userId: string) => {
                    return Array.from(mailInboxes.values()).filter(
                        (mib: MailInbox) => mib.userId === userId
                    );
                },
                get: async (id: string): Promise<MailInbox | undefined> => {
                    return mailInboxes.get(id);
                },
                delete: async (id: string): Promise<void> => {
                    mailInboxes.delete(id);
                },
            }),
            checkMailInbox: asClass(CheckMailInbox).singleton(),
        });
    });
    it('should return an empty array when no mail has been sent', async () => {
        const checkMailInbox = container.resolve<CheckMailInbox>('checkMailInbox');
        const mib = await checkMailInbox.execute('1');
        expect(mib).toEqual([]);
    });
    it('should return 1 mail inbox entry', async () => {
        mailMessages.set('a1000', {
            id: 'a1000',
            recipientIds: ['2'],
            content: 'xyz',
            topic: 'topic1',
            senderId: '1',
            tsCreation: Date.now(),
        });
        mailInboxes.set('2-a1000', {
            userId: '2',
            messageId: 'a1000',
            tsReceived: Date.now(),
            tag: 1,
            read: false,
            pinned: false,
            deleted: false,
        });
        const checkMailInbox = container.resolve<CheckMailInbox>('checkMailInbox');
        const mib = await checkMailInbox.execute('2');
        expect(mib).toEqual([
            {
                tag: 1,
                topic: 'topic1',
                date: 'xx-xx-xx',
                read: false,
                pinned: false,
                sender: 'Ralphy',
            },
        ]);
    });
});
