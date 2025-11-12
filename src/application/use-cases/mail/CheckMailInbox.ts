import { Cradle } from '../../../boot/container';
import { IMailInboxRepository } from '../../../domain/ports/repositories/IMailInboxRepository';
import { IMailMessageRepository } from '../../../domain/ports/repositories/IMailMessageRepository';
import { MailInbox } from '../../../domain/entities/MailInbox';

/**
 * Reads all inbox entries for the specified user.
 * Returns a list of undeleted inbox entries, ordered by timestamp (desc)
 * Retags all untagged entries.
 * Deletes entries that are too old.
 */
export class CheckMailInbox {
    private readonly mailInboxRepository: IMailInboxRepository;
    private readonly mailMessageRepository: IMailMessageRepository;

    constructor(cradle: Cradle) {
        this.mailInboxRepository = cradle.mailInboxRepository;
        this.mailMessageRepository = cradle.mailMessageRepository;
    }

    getMinimalMissingValue(aValues: number[], minValue = 1) {
        const aSortedValues = [
            ...new Set(aValues.filter((x) => Number.isInteger(x) && x >= minValue)),
        ].sort((a, b) => a - b);
        if (aSortedValues.length == 0) {
            return minValue;
        }
        if (minValue > aSortedValues[aSortedValues.length - 1]) {
            return minValue;
        }
        let nExpectedValue = minValue;
        for (let i = 0, l = aSortedValues.length; i < l; ++i) {
            if (aSortedValues[i] > nExpectedValue) {
                return nExpectedValue;
            }
            ++nExpectedValue;
        }
        return nExpectedValue;
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
            const nTag = this.getMinimalMissingValue(aTags, 1);
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

    execute() {}
}
