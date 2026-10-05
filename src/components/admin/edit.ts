import { notFound } from "next/navigation";

/** "/new" → null (create); a positive integer → id; anything else → 404. */
export function editId(raw: string): number | null {
  if (raw === "new") return null;
  if (!/^\d{1,9}$/.test(raw)) notFound();
  const n = Number(raw);
  if (n < 1) notFound();
  return n;
}
