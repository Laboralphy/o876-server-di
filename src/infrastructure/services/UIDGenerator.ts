import { IIdGenerator } from '../../application/ports/services/IIdGenerator';
import { generateUID } from '../../libs/uid-generator';

export class UIDGenerator implements IIdGenerator {
    generateUID(): string {
        return generateUID(10);
    }
    getMinimalMissingValue(aValues: number[], minValue: number = 1): number {
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
}
