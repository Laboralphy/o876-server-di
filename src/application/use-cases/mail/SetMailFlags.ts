import { Cradle } from '../../../boot/container';
import { MailInboxRepository } from '../../../infrastructure/persistance/json-database/MailInboxRepository';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { MailInbox } from '../../../domain/entities/MailInbox';
import { SetMailFlagsDto } from '../../dto/SetMailFlagsDto';

/**
 * Deletes a mail inbox entry
 */
export class SetMailFlags {
    private readonly mailInboxRepository: MailInboxRepository;

    constructor(cradle: Cradle) {
        this.mailInboxRepository = cradle.mailInboxRepository;
    }

    async execute(idMib: string, flags: SetMailFlagsDto) {
        const mib: MailInbox | undefined = await this.mailInboxRepository.get(idMib);
        if (mib) {
            if (flags.deleted !== undefined) {
                mib.deleted = flags.deleted;
            }
            if (flags.kept !== undefined) {
                mib.kept = flags.kept;
            }
            if (flags.read !== undefined) {
                mib.read = flags.read;
            }
            await this.mailInboxRepository.save(mib);
        } else {
            throw new ReferenceError(
                USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` mail inbox entry ${idMib} not found.`
            );
        }
    }
}
