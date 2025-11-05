import { IUIDGenerator } from '../../application/ports/services/IUIDGenerator';
import { generateUID } from '../../libs/uid-generator';

export class UIDGenerator implements IUIDGenerator {
    generateUID(): string {
        return generateUID(10);
    }
}
