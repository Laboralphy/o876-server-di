import { IIdGenerator } from '../../application/ports/services/IIdGenerator';
import { generateUID } from '../../libs/uid-generator';
import { getMinimalMissingValue } from 'o876-json-db/src/get-minimal-missing-value';

export class UIDGenerator implements IIdGenerator {
    generateUID(): string {
        return generateUID(10);
    }
    getMinimalMissingValue(aValues: number[], minValue: number = 1): number {
        return getMinimalMissingValue(aValues, minValue);
    }
}
