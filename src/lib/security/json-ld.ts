const LS = String.fromCharCode(0x2028); // line separator
const PS = String.fromCharCode(0x2029); // paragraph separator

/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 * Plain JSON.stringify leaves "</script>" intact, so a title containing it would break out
 * of the tag and run as HTML. Escaping "<", ">", "&" and the JS line separators prevents that.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LS)
    .join("\\u2028")
    .split(PS)
    .join("\\u2029");
}
