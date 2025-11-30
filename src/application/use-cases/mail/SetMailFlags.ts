import { Cradle } from '../../../boot/container';
import { MailInboxRepository } from '../../../infrastructure/persistance/json-database/MailInboxRepository';
import { USE_CASE_ERRORS } from '../../../domain/enums/use-case-errors';
import { MailInbox } from '../../../domain/entities/MailInbox';

/**
 * Deletes a mail inbox entry
 */
export class DeleteMail {
    private readonly mailInboxRepository: MailInboxRepository;

    constructor(cradle: Cradle) {
        this.mailInboxRepository = cradle.mailInboxRepository;
    }

    async execute(idMib: string) {
        const mib: MailInbox | undefined = await this.mailInboxRepository.get(idMib);
        if (mib) {
            mib.deleted = true;
        } else {
            throw new ReferenceError(
                USE_CASE_ERRORS.ENTITY_NOT_FOUND + ` mail inbox entry ${idMib} not found.`
            );
        }
    }
}
