import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { UIDGenerator } from '../src/infrastructure/services/UIDGenerator';
import { User } from '../src/domain/entities/User';
import { MailMessage } from '../src/domain/entities/MailMessage';
import { MailInbox } from '../src/domain/entities/MailInbox';
import { SendMail } from '../src/application/use-cases/mail/SendMail';

describe('SendUserMail', () => {
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
                        mailMaxMessageLength: 1024,
                        mailMaxExpirationDays: 30,
                        mailMaxKeptMessages: 20,
                        mailMaxTopicLength: 40,
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
            }),
            sendMailMessage: asClass(SendMail).singleton(),
        });
    });
    it('should send message to user 2 & 3 from user 1', async () => {
        const sendMailMessage = container.resolve<SendMail>('sendMailMessage');
        await sendMailMessage.execute(
            '1',
            ['2', '3'],
            'dungeon raid tonight 21:00',
            'please comme with your mightiest weapons.'
        );
        const mailSent = Array.from(mailMessages.values())[0];
        expect(mailSent).toMatchObject({
            content: 'please comme with your mightiest weapons.',
            topic: 'dungeon raid tonight 21:00',
            recipientIds: ['2', '3'],
            senderId: '1',
        });
        const mailInbox0 = Array.from(mailInboxes.values())[0];
        const mailInbox1 = Array.from(mailInboxes.values())[1];
        expect(mailInbox0).toMatchObject({
            userId: '2',
            tag: 1,
            deleted: false,
            kept: false,
            read: false,
        });
        expect(mailInbox1).toMatchObject({
            userId: '3',
            tag: 1,
            deleted: false,
            kept: false,
            read: false,
        });
    });
    it('should throw an error and should not send message, if one of recipients does not exist', async () => {
        const sendMailMessage = container.resolve<SendMail>('sendMailMessage');
        await expect(
            sendMailMessage.execute(
                '1',
                ['3', '4'],
                "some of you don't really exist in the database",
                "Some of the users I send this message don't exist, so the operation will likely throw an error"
            )
        ).rejects.toThrow('ENTITY_NOT_FOUND User ids : 4');
        expect(mailInboxes.size).toBe(0);
        expect(mailMessages.size).toBe(0);
    });
    it('should not send message multiple times when parameters specify a user id several times', async () => {
        const sendMailMessage = container.resolve<SendMail>('sendMailMessage');
        expect(mailInboxes.size).toBe(0);
        expect(mailMessages.size).toBe(0);
        await sendMailMessage.execute(
            '1',
            ['3', '3', '3', '3'],
            'Sending this message to user 3 x 4',
            'You should not receive this message 4 times.'
        );
        expect(mailInboxes.size).toBe(1);
        expect(mailMessages.size).toBe(1);
    });
});
