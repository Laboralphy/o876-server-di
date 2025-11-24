export interface ICellString {
    /**
     * the number of printable characters
     */
    get length(): number;

    /**
     * The real string length counting all non printable characters
     */
    get rawLength(): number;

    /**
     * The final output text, that will be rendered.
     */
    toString(): string;
}
