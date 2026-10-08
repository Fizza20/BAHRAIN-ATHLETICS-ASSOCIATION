import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import { assertCan, logActivity, type SessionUser } from "@/lib/auth";
import type { Resource } from "@/lib/permissions";
import { UserError } from "@/lib/errors";

/** State returned by form actions used with useActionState. */
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

/** Result of imperative actions (delete, bulk, toggles) called from client components. */
export type ActionResult = { ok: boolean; message: string };

/* ---------- zod building blocks for FormData ---------- */

const blankToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const f = {
  /** Required trimmed string. */
  str: (max = 200, msg = "This field is required") => z.string({ error: msg }).trim().min(1, msg).max(max, `Keep it under ${max} characters`),
  /** Optional string; empty → null. */
  optStr: (max = 20000) =>
    z.preprocess(blankToNull, z.string().trim().max(max, `Keep it under ${max} characters`).nullable().optional()).transform((v) => v ?? null),
  /** Optional URL or site-relative path. */
  optUrl: () =>
    z
      .preprocess(blankToNull, z.string().trim().max(2000).nullable().optional())
      .transform((v) => v ?? null)
      .refine((v) => !v || /^https?:\/\/[^\s<>"']+$/.test(v) || /^\/[^\s/\\]\S*$/.test(v), "Use a full https:// address or a site path like /about"),
  slug: () =>
    z
      .string({ error: "Slug is required" })
      .trim()
      .toLowerCase()
      .min(1, "Slug is required")
      .max(90, "Keep the slug under 90 characters")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens"),
  /** Optional integer; empty → null. */
  optInt: (min = -1e9, max = 1e9) =>
    z.preprocess(
      (v) => (blankToNull(v) === null || v === undefined ? null : Number(v)),
      z.number({ error: "Enter a whole number" }).int("Enter a whole number").min(min, `Must be at least ${min}`).max(max, `Must be at most ${max}`).nullable(),
    ),
  int: (min = -1e9, max = 1e9) =>
    z.preprocess((v) => (blankToNull(v) === null || v === undefined ? undefined : Number(v)), z.number({ error: "Enter a whole number" }).int("Enter a whole number").min(min, `Must be at least ${min}`).max(max, `Must be at most ${max}`)),
  /** Optional foreign key id (select); empty → null. */
  optId: () => z.preprocess((v) => (blankToNull(v) === null || v === undefined ? null : Number(v)), z.number().int().positive().nullable()),
  id: (msg = "Choose an option") => z.preprocess((v) => (blankToNull(v) === null || v === undefined ? undefined : Number(v)), z.number({ error: msg }).int(msg).positive(msg)),
  /** Checkbox: present ("on") → true. */
  bool: () => z.preprocess((v) => v === "on" || v === "true" || v === "1" || v === true, z.boolean()),
  /** ISO date yyyy-mm-dd, optional. */
  optDate: () =>
    z.preprocess(blankToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker (yyyy-mm-dd)").nullable().optional()).transform((v) => v ?? null),
  date: () => z.string({ error: "Date is required" }).regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required"),
  /** datetime-local (yyyy-mm-ddThh:mm) → stored as Bahrain-time ISO string. */
  optDateTime: () =>
    z
      .preprocess(blankToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Use the date and time picker").nullable().optional())
      .transform((v) => (v ? `${v}:00+03:00` : null)),
  enum: <T extends readonly [string, ...string[]]>(values: T, msg = "Choose an option") => z.enum(values, { error: msg }),
  optEnum: <T extends readonly [string, ...string[]]>(values: T) =>
    z.preprocess(blankToNull, z.enum(values).nullable().optional()).transform((v) => v ?? null),
};

/** FormData → plain object; repeated keys become arrays. Next's internal $ACTION keys are dropped. */
export function formToObject(fd: FormData) {
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

export function parseForm<T extends z.ZodType>(schema: T, fd: FormData): { ok: true; data: z.infer<T> } | { ok: false; state: FormState } {
  const r = schema.safeParse(formToObject(fd));
  if (r.success) return { ok: true, data: r.data };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, state: { ok: false, errors, message: "Please fix the highlighted fields." } };
}

const idSchema = z.coerce.number().int().positive();

/** Validates an id from the client. Throws on anything that isn't a positive integer. */
export function parseId(v: unknown): number {
  const r = idSchema.safeParse(v);
  if (!r.success) throw new UserError("Invalid id");
  return r.data;
}

export function parseIds(v: unknown): number[] {
  if (!Array.isArray(v)) throw new UserError("Invalid selection");
  const ids = v.map(parseId);
  if (ids.length === 0) throw new UserError("Nothing selected");
  if (ids.length > 500) throw new UserError("Too many rows selected");
  return [...new Set(ids)];
}

/** Optional id from a hidden form field ("" → null). */
export function formId(fd: FormData, key = "id"): number | null {
  const v = fd.get(key);
  if (v === null || v === "") return null;
  return parseId(v);
}

/**
 * Only deliberate UserErrors reach the browser. Anything else (database, driver, bug) is logged on
 * the server and replaced by a generic message so SQL, table names and stack details never leak.
 */
export function errorMessage(e: unknown) {
  if (e instanceof UserError) return e.message;
  console.error("[action error]", e);
  return "Something went wrong. Please try again.";
}

/** Detects a UNIQUE constraint violation on a given column (libSQL wraps it in DrizzleQueryError.cause). */
export function isUniqueViolation(e: unknown, column?: string) {
  const parts: string[] = [];
  let cur: unknown = e;
  for (let i = 0; i < 4 && cur; i++) {
    if (cur instanceof Error) parts.push(cur.message);
    cur = (cur as { cause?: unknown }).cause;
  }
  const text = parts.join(" | ");
  return /UNIQUE constraint failed/i.test(text) && (!column || text.includes(column));
}

export function revalidate(paths: (string | null | undefined | false)[]) {
  for (const p of new Set(paths.filter(Boolean) as string[])) {
    // dynamic route patterns ("/athletes/[slug]") need an explicit type
    if (p.includes("[")) revalidatePath(p, "page");
    else revalidatePath(p);
  }
}

export function toastUrl(path: string, message: string) {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}toast=${encodeURIComponent(message)}`;
}

export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain" }).format(new Date());
}

/* ---------- generic delete (single + bulk) ---------- */


type Row = Record<string, unknown>;
type TableWithId = SQLiteTable & { id: SQLiteColumn };

export async function removeRows(
  opts: {
    resource: Resource;
    table: TableWithId;
    entity: string;
    label: (row: Row) => string;
    paths: (rows: Row[]) => (string | null | undefined | false)[];
    /** Optional extra guard, e.g. only demo rows. Return an error message to refuse. */
    guard?: (rows: Row[]) => string | null;
  },
  raw: number | number[],
): Promise<ActionResult> {
  try {
    const user = await assertCan(opts.resource, "delete");
    const ids = Array.isArray(raw) ? parseIds(raw) : [parseId(raw)];
    const rows = (await db.select().from(opts.table).where(inArray(opts.table.id, ids))) as Row[];
    if (rows.length === 0) return { ok: false, message: "Nothing to delete: the row(s) no longer exist." };
    const refusal = opts.guard?.(rows);
    if (refusal) return { ok: false, message: refusal };
    await db.delete(opts.table).where(inArray(opts.table.id, rows.map((r) => r.id as number)));
    if (rows.length === 1) await logActivity(user.id, "deleted", opts.entity, rows[0].id as number, opts.label(rows[0]));
    else await logActivity(user.id, "deleted", opts.entity, null, `${rows.length} ${opts.entity} rows (bulk)`);
    revalidate(opts.paths(rows));
    return { ok: true, message: rows.length === 1 ? `“${opts.label(rows[0])}” deleted.` : `${rows.length} items deleted.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

/* ---------- generic create/update ---------- */


export async function saveRow<S extends z.ZodType<Row>>(
  opts: {
    resource: Resource;
    table: TableWithId;
    schema: S;
    entity: string;
    listPath: string;
    label: (data: z.infer<S>) => string;
    paths: (data: z.infer<S>, old: Row | null) => (string | null | undefined | false)[];
    unique?: { column: string; field: string; message: string };
    /** Adjust values before writing (computed columns, permission rules). Return a FormState to abort. */
    prepare?: (data: z.infer<S>, ctx: { user: SessionUser; id: number | null; old: Row | null; fd: FormData }) => Promise<Row | FormState> | Row | FormState;
    /** Runs after the main write (join tables etc.). */
    after?: (id: number, data: Row, ctx: { user: SessionUser; old: Row | null; fd: FormData }) => Promise<void>;
    /** Activity verb override, e.g. "published". */
    verb?: (data: Row, old: Row | null) => string | null;
    hasUpdatedAt?: boolean;
  },
  fd: FormData,
): Promise<FormState> {
  let user: SessionUser;
  let id: number | null;
  try {
    user = await assertCan(opts.resource, "write");
    id = formId(fd);
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  const parsed = parseForm(opts.schema, fd);
  if (!parsed.ok) return parsed.state;

  let old: Row | null = null;
  if (id) {
    old = ((await db.select().from(opts.table).where(eq(opts.table.id, id)))[0] as Row | undefined) ?? null;
    if (!old) return { ok: false, message: "This record no longer exists. It may have been deleted by someone else." };
  }

  let values: Row = parsed.data;
  if (opts.prepare) {
    const r = await opts.prepare(parsed.data, { user, id, old, fd });
    if ("errors" in r || "message" in r || "ok" in r) return r as FormState;
    values = r;
  }

  let savedId = id;
  try {
    if (id) {
      await db
        .update(opts.table)
        .set(opts.hasUpdatedAt ? { ...values, updatedAt: new Date() } : values)
        .where(eq(opts.table.id, id));
    } else {
      const [row] = (await db.insert(opts.table).values(values).returning()) as Row[];
      savedId = row.id as number;
    }
    if (opts.after && savedId) await opts.after(savedId, values, { user, old, fd });
  } catch (e) {
    if (opts.unique && isUniqueViolation(e, opts.unique.column)) {
      return { ok: false, message: "Please fix the highlighted fields.", errors: { [opts.unique.field]: opts.unique.message } };
    }
    return { ok: false, message: errorMessage(e) };
  }

  const label = opts.label(parsed.data);
  const verb = opts.verb?.(values, old) ?? (id ? "updated" : "created");
  await logActivity(user.id, verb, opts.entity, savedId, label);
  revalidate([...opts.paths(parsed.data, old), opts.listPath, "/admin"]);
  redirect(toastUrl(opts.listPath, `“${label}” ${verb === "submitted" ? "submitted for review" : verb}.`));
}
