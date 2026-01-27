import { asClass, asValue, AwilixContainer, createContainer } from 'awilix';
import { User } from '../src/domain/entities/User';
import { ROLES } from '../src/domain/enums/roles';
import { MailMessage } from '../src/domain/entities/MailMessage';
import { ServerConfigOptions } from '../src/domain/types/ServerConfig';
import { JsonObject } from '../src/domain/types/JsonStruct';
import { SendMail } from '../src/application/use-cases/mail/SendMail';

describe('SendMail', () => {
    let container: AwilixContainer<any>;
    const currentDate = new Date();
    let logPrint: string[] = [];
    const mailMessages = new Map<string, MailMessage>();
    const users = new Map<string, User>();
    beforeEach(() => {
        currentDate.setTime(Date.now());
        logPrint = [];
        let uniqueIdGenerated = 0;
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
                        language: 'en',
                        modules: [],
                        clientKeepAliveDelay: 30,
                    };
                },
            }),
            idGenerator: asValue({
                generateUID: () => (++uniqueIdGenerated).toString(),
            }),
            communicationLayer: asValue({
                getUserClient: () => undefined,
            }),
            sendClientMessage: asValue({
                execute: async (
                    idClient: string,
                    key: string,
                    params?: JsonObject
                ): Promise<void> => {
                    logPrint.push(`${key} ${JSON.stringify(params)}`);
                },
            }),
            sendMail: asClass(SendMail).singleton(),
        });
    });

    it('message should be stored when alice when send message to bob', async () => {
        expect(mailMessages.size).toBe(0);
        const sendMail = container.resolve<SendMail>('sendMail');
        await sendMail.execute('a', 'b', 'message from alice to bob');
        expect(mailMessages.size).toBe(1);
        expect(Array.from(mailMessages.values())[0]).toMatchObject({
            id: '1',
            senderId: 'a',
            recipientId: 'b',
            content: 'message from alice to bob',
        });
    });

    it('message should not be stored when alice when send message to an unexisting user', async () => {
        expect(mailMessages.size).toBe(0);
        const sendMail = container.resolve<SendMail>('sendMail');
        await expect(
            sendMail.execute('a', 'x', 'message from alice to an unknown user')
        ).rejects.toThrow('ENTITY_NOT_FOUND user : x');
        expect(mailMessages.size).toBe(0);
    });

    it('message should not be stored when alice when send message to bob when bob is online', async () => {
        container.register(
            'communicationLayer',
            asValue({
                // Bob should be online now
                getUserClient: (u: User): { user: User } => ({
                    user: u,
                }),
            })
        );
        const sendMail = container.resolve<SendMail>('sendMail');
        await sendMail.execute('a', 'b', 'message from alice to bob');
        expect(mailMessages.size).toBe(0);
        expect(logPrint[0]).toBe(
            'mail-instant {"sender":"Bob","message":"message from alice to bob"}'
        );
    });
});
