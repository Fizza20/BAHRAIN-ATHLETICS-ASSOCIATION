/**
 * Every dictionary module is written as `defineDict({ en: {...}, ar: {...} })`.
 * TypeScript enforces that Arabic has exactly the same keys as English.
 */
export function defineDict<const E extends Record<string, string>>(d: { en: E; ar: { [K in keyof E]: string } }) {
  return d;
}
