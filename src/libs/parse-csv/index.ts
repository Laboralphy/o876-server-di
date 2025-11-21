const COMMA = ',';
const QUOTE = '"';

/**
 * @author Copilot
 * @param line {string}
 * @returns {string[]}
 */
export function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let insideQuotes: boolean = false;
    let currentField: string = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === QUOTE && insideQuotes && line[i + 1] === QUOTE) {
            // Handle escaped quotes
            currentField += QUOTE;
            i++; // Skip the next quote
        } else if (char === QUOTE) {
            // Toggle the insideQuotes flag
            insideQuotes = !insideQuotes;
        } else if (char === COMMA && !insideQuotes) {
            // If we encounter a comma and we're not inside quotes, it's the end of a field
            result.push(currentField.trim());
            currentField = '';
        } else {
            // Append the current character to the current field
            currentField += char;
        }
    }
    // Add the last field
    result.push(currentField.trim());
    return result;
}
