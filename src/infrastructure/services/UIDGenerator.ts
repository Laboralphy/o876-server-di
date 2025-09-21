import { nanoid } from 'nanoid';
import { IUIDGenerator } from '../../domain/interfaces/interactors/IUIDGenerator';

const NANOID_LENGTH = 10;

export class UIDGenerator implements IUIDGenerator {
    getUID() {
        return nanoid(NANOID_LENGTH);
    }
}
