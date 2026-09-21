/**
 * Escapes special regex metacharacters in a string so it can be safely
 * used inside `new RegExp()` as a literal match.
 * 
 * Without this, user-supplied strings containing characters like .*+?^${}()|[]\
 * could be interpreted as regex operators, enabling ReDoS attacks or
 * bypassing exact-match intent.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a case-insensitive exact-match regex for MongoDB queries.
 * Equivalent to: { field: { $regex: new RegExp(`^${escaped}$`, 'i') } }
 * 
 * @param value - The raw user input to match exactly (case-insensitive)
 * @returns A MongoDB-compatible regex query object
 */
export function caseInsensitiveExact(value: string) {
  return { $regex: new RegExp(`^${escapeRegex(value)}$`, 'i') };
}
