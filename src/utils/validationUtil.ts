/**
 * Checks if a value is null, undefined, an empty string, or whitespace-only string
 * @param value The value to check
 * @returns true if the value is null/undefined/empty/whitespace, false otherwise
 */
export function isNullOrEmpty(value: unknown): boolean {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
    );
}