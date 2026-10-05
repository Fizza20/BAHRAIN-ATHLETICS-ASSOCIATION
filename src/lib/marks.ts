/** Converts an athletics mark to a sortable number: seconds for times, metres for distances, raw for points. */
export function parseMark(mark: string | null | undefined): number | null {
  if (!mark) return null;
  const clean = mark.trim().replace(/[^\d:.]/g, "");
  if (!clean) return null;
  const parts = clean.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

export function isBetter(a: number, b: number, measure: "time" | "distance" | "points") {
  return measure === "time" ? a < b : a > b;
}

export function unitFor(measure: "time" | "distance" | "points") {
  return measure === "distance" ? "m" : measure === "points" ? "pts" : "";
}
