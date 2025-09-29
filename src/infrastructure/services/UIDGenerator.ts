import { IUIDGenerator } from '../../application/ports/services/IUIDGenerator';
import { getUID } from '../../libs/uid-generator';

export class UIDGenerator implements IUIDGenerator {
    getUID(): string {
        return getUID(10);
    }
}
