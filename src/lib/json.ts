/**
 * Safe JSON field parser that handles both TEXT (string) and JSONB (object) columns.
 * Use this when reading fields that may be TEXT or JSONB depending on migration state.
 */
export function parseJsonField<T = unknown>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}
