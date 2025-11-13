/**
 * This interface is responsible for generating identifier
 * There are several method to generate identifier
 * - unique string identifiers
 * - numeric identifiers that are not in a specified array of numbers
 */
export interface IIdGenerator {
    /**
     * Generates a unique id, each time this function is called, it returns an id.
     * This id is ideally unique (never generated before)
     * example of good uid : uuid
     * @return the generated string id
     */
    generateUID(): string;

    /**
     * Returns the lowest possible integer value, that is not in "aValues", but always
     * greater or equal to the "minValue" parameter if specified (default 1)
     * This function is great to general extra-small id, that are unique in a particular namespace
     * @example ([1, 2, 5, 6, 7], 1) => 3 (the minimal value that is not in the given set of value
     * @example ([], 1) => 1
     * @example ([1], 1) => 2
     * @param aValues
     * @param minValue
     */
    getMinimalMissingValue(aValues: number[], minValue?: number): number;
}
