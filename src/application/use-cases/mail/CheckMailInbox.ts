import { Cradle } from '../../../boot/container';
import { IMailInboxRepository } from '../../../domain/ports/repositories/IMailInboxRepository';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { MailInbox } from '../../../domain/entities/MailInbox';
import { ITime } from '../../ports/services/ITime';
import { IUserRepository } from '../../../domain/ports/repositories/IUserRepository';
import { IServerConfig } from '../../ports/services/IServerConfig';
import { IIdGenerator } from '../../ports/services/IIdGenerator';

export type CheckMailInboxEntry = {
    tag: number;
    message: string;
    date: string;
    sender: string;
    kept: boolean;
    read: boolean;
};

/**
 * Reads all inbox entries for the specified user.
 * Returns a list of undeleted inbox entries, ordered by timestamp (desc)
 * Retags all untagged entries.
 * Deletes entries that are too old.
 */
export class CheckMailInbox {
    private readonly mailInboxRepository: IMailInboxRepository;
    private readonly mailMessageRepository: IMailMessageRepository;
    private readonly userRepository: IUserRepository;
    private readonly time: ITime;
    private readonly serverConfig: IServerConfig;
    private readonly idGenerator: IIdGenerator;

    constructor(cradle: Cradle) {
        this.mailInboxRepository = cradle.mailInboxRepository;
        this.mailMessageRepository = cradle.mailMessageRepository;
        this.userRepository = cradle.userRepository;
        this.time = cradle.time;
        this.serverConfig = cradle.serverConfig;
        this.idGenerator = cradle.idGenerator;
    }

    async checkInbox(userId: string): Promise<MailInbox[]> {
        // get all users inbox entries
        const aInbox: MailInbox[] = await this.mailInboxRepository.findByUserId(userId);
        // get the maximum value of tag
        const aTags = aInbox.map((mib) => mib.tag);
        // Filter all untagged (0) inbox entries
        const aUntagged = aInbox.filter((mib) => mib.tag == 0);
        // Tags all untagged inbox entries with auto incremental tag
        for (const untaggedMib of aUntagged) {
            const nTag = this.idGenerator.getMinimalMissingValue(aTags, 1);
            aTags.push(nTag);
            // save those newly tagged inbox entries
            const m2: MailInbox = {
                ...untaggedMib,
                tag: nTag,
            };
            await this.mailInboxRepository.save(m2);
            untaggedMib.tag = nTag;
        }
        return aInbox
            .filter((a) => !a.deleted)
            .sort((a, b) => {
                if (a.kept == b.kept) {
                    return b.tsReceived - a.tsReceived;
                } else {
                    return a.kept ? -1 : 1;
                }
            });
    }

    async execute(userId: string): Promise<CheckMailInboxEntry[]> {
        const tsNow = this.time.now();
        const tsExpirationDuration =
            this.serverConfig.getVariables().mailMaxExpirationDays * 24 * 3600 * 1000;
        const tsExpired = tsNow - tsExpirationDuration;
        // get raw inbox entries
        const aInbox = await this.checkInbox(userId);
        // get message extracts
        const aMessages = await Promise.all(
            aInbox.map((mib) => this.mailMessageRepository.get(mib.messageId))
        );
        const nMaxMessageLength = this.serverConfig.getVariables().mailMaxMessagePreviewLength;
        const aResult: CheckMailInboxEntry[] = [];
        const aDelete: Promise<void>[] = [];
        for (let i = 0; i < aInbox.length; i += 1) {
            const mib = aInbox[i];
            const msg = aMessages[i];
            // delete message if expired
            if (mib.tsReceived < tsExpired) {
                aDelete.push(this.mailInboxRepository.delete(mib));
                continue;
            }
            if (msg) {
                const senderUser = await this.userRepository.get(msg.senderId);
                const entry: CheckMailInboxEntry = {
                    tag: mib.tag,
                    message:
                        msg.topic.length > nMaxMessageLength
                            ? msg.topic.substring(0, nMaxMessageLength - 3) + '...'
                            : msg.topic,
                    date: this.time.renderDate(mib.tsReceived, 'ymd hm'),
                    read: mib.read,
                    kept: mib.kept,
                    sender: senderUser?.name ?? '???',
                };
                aResult.push(entry);
            }
        }
        await Promise.all(aDelete);
        return aResult;
    }
}
