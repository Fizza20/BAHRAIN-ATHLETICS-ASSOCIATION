"use server";

import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema as s } from "@/db";
import { assertCan, logActivity } from "@/lib/auth";
import { errorMessage, f, formId, isUniqueViolation, parseForm, parseId, parseIds, revalidate, toastUrl, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  slug: f.slug(),
  firstName: f.str(80, "First name is required"),
  lastName: f.str(80, "Last name is required"),
  nameAr: f.optStr(160),
  gender: f.enum(["men", "women"] as const, "Choose a gender"),
  category: f.enum(["senior", "u23", "u20", "u18", "u16"] as const),
  status: f.enum(["active", "retired"] as const),
  primaryDisciplineId: f.optId(),
  birthYear: f.optInt(1900, new Date().getFullYear()),
  club: f.optStr(120),
  headline: f.optStr(200),
  bio: f.optStr(8000),
  imageUrl: f.optUrl(),
  featured: f.bool(),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

const paths = (slug?: string) => ["/", "/athletes", slug && `/athletes/${slug}`, "/results", "/admin/athletes", "/admin"];

export async function saveAthlete(_: FormState, fd: FormData): Promise<FormState> {
  let user, id;
  try {
    user = await assertCan("athletes", "write");
    id = formId(fd);
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  const parsed = parseForm(schema, fd);
  if (!parsed.ok) return parsed.state;
  const data = parsed.data;
  let oldSlug: string | undefined;
  let savedId = id;
  try {
    if (id) {
      const [old] = await db.select({ slug: s.athletes.slug }).from(s.athletes).where(eq(s.athletes.id, id));
      if (!old) return { ok: false, message: "This athlete no longer exists." };
      oldSlug = old.slug;
      await db.update(s.athletes).set({ ...data, updatedAt: new Date() }).where(eq(s.athletes.id, id));
    } else {
      const [row] = await db.insert(s.athletes).values(data).returning({ id: s.athletes.id });
      savedId = row.id;
    }
  } catch (e) {
    if (isUniqueViolation(e, "slug")) return { ok: false, message: "Please fix the highlighted fields.", errors: { slug: "Another athlete already uses this slug." } };
    return { ok: false, message: errorMessage(e) };
  }
  const name = `${data.firstName} ${data.lastName}`;
  await logActivity(user.id, id ? "updated" : "created", "athlete", savedId, name);
  revalidate([...paths(data.slug), oldSlug && `/athletes/${oldSlug}`]);
  redirect(toastUrl("/admin/athletes", `${name} ${id ? "updated" : "created"}.`));
}

export async function deleteAthlete(rawId: number): Promise<ActionResult> {
  try {
    const user = await assertCan("athletes", "delete");
    const id = parseId(rawId);
    const [row] = await db.select().from(s.athletes).where(eq(s.athletes.id, id));
    if (!row) return { ok: false, message: "Athlete not found." };
    // results + news links cascade; achievements are kept but unlinked (FK set null)
    await db.delete(s.athletes).where(eq(s.athletes.id, id));
    await logActivity(user.id, "deleted", "athlete", id, `${row.firstName} ${row.lastName}`);
    revalidate(paths(row.slug));
    return { ok: true, message: `${row.firstName} ${row.lastName} deleted.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function bulkDeleteAthletes(rawIds: number[]): Promise<ActionResult> {
  try {
    const user = await assertCan("athletes", "delete");
    const ids = parseIds(rawIds);
    const rows = await db.delete(s.athletes).where(inArray(s.athletes.id, ids)).returning({ id: s.athletes.id });
    await logActivity(user.id, "deleted", "athlete", null, `${rows.length} athletes (bulk)`);
    revalidate(paths());
    return { ok: true, message: `${rows.length} athlete(s) deleted.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function bulkFeatureAthletes(rawIds: number[]): Promise<ActionResult> {
  try {
    const user = await assertCan("athletes", "write");
    const ids = parseIds(rawIds);
    await db.update(s.athletes).set({ featured: true, updatedAt: new Date() }).where(inArray(s.athletes.id, ids));
    await logActivity(user.id, "updated", "athlete", null, `Featured ${ids.length} athletes`);
    revalidate(paths());
    return { ok: true, message: `${ids.length} athlete(s) featured on the homepage.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
