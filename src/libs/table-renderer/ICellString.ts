export interface ICellString {
    /**
     * the number of printable characters
     */
    get length(): number;

    /**
     * The final output text, that will be rendered.
     */
    toString(): string;
}
