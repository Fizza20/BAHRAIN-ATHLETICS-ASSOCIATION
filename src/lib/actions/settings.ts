"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq, inArray, or } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { assertCan, logActivity } from "@/lib/auth";
import { errorMessage, parseForm, revalidate, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  "site.tagline": z.string().trim().min(1, "Tagline is required").max(160, "Keep it under 160 characters"),
  "site.demoBanner": z.preprocess((v) => (v === "on" ? "true" : "false"), z.enum(["true", "false"])),
});

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  let user;
  try {
    user = await assertCan("settings", "write");
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  const parsed = parseForm(schema, fd);
  if (!parsed.ok) return parsed.state;
  for (const [key, value] of Object.entries(parsed.data)) {
    await db.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
  }
  await logActivity(user.id, "updated", "settings", null, "Site settings");
  revalidate(["/", "/admin/settings"]);
  return { ok: true, message: "Settings saved." };
}

/**
 * Danger zone: removes every row flagged isDemo. Order matters for referential integrity:
 * child rows (results, news links) first, then references to demo parents are cleared on
 * real rows, then the demo parents themselves.
 */
export async function purgeDemoData(confirmation: string): Promise<ActionResult> {
  try {
    const user = await assertCan("settings", "delete");
    if (confirmation !== "DELETE DEMO") return { ok: false, message: "Type DELETE DEMO exactly to confirm." };

    const counts = await db.transaction(async (tx) => {
      const demoAthletes = (await tx.select({ id: s.athletes.id }).from(s.athletes).where(eq(s.athletes.isDemo, true))).map((r) => r.id);
      const demoComps = (await tx.select({ id: s.competitions.id }).from(s.competitions).where(eq(s.competitions.isDemo, true))).map((r) => r.id);
      const demoNews = (await tx.select({ id: s.news.id }).from(s.news).where(eq(s.news.isDemo, true))).map((r) => r.id);
      const c: Record<string, number> = {};

      c.results = (
        await tx
          .delete(s.results)
          .where(demoAthletes.length ? or(eq(s.results.isDemo, true), inArray(s.results.athleteId, demoAthletes)) : eq(s.results.isDemo, true))
          .returning({ id: s.results.id })
      ).length;
      if (demoNews.length) await tx.delete(s.newsAthletes).where(inArray(s.newsAthletes.newsId, demoNews));
      if (demoAthletes.length) {
        await tx.delete(s.newsAthletes).where(inArray(s.newsAthletes.athleteId, demoAthletes));
        await tx.update(s.achievements).set({ athleteId: null }).where(inArray(s.achievements.athleteId, demoAthletes));
      }
      if (demoComps.length) {
        await tx.update(s.results).set({ competitionId: null }).where(inArray(s.results.competitionId, demoComps));
        await tx.update(s.events).set({ competitionId: null }).where(inArray(s.events.competitionId, demoComps));
        await tx.update(s.news).set({ competitionId: null }).where(inArray(s.news.competitionId, demoComps));
        await tx.update(s.achievements).set({ competitionId: null }).where(inArray(s.achievements.competitionId, demoComps));
      }
      c.news = (await tx.delete(s.news).where(eq(s.news.isDemo, true)).returning({ id: s.news.id })).length;
      c.achievements = (await tx.delete(s.achievements).where(eq(s.achievements.isDemo, true)).returning({ id: s.achievements.id })).length;
      c.events = (await tx.delete(s.events).where(eq(s.events.isDemo, true)).returning({ id: s.events.id })).length;
      c.athletes = (await tx.delete(s.athletes).where(eq(s.athletes.isDemo, true)).returning({ id: s.athletes.id })).length;
      c.competitions = (await tx.delete(s.competitions).where(eq(s.competitions.isDemo, true)).returning({ id: s.competitions.id })).length;
      c.board = (await tx.delete(s.boardMembers).where(eq(s.boardMembers.isDemo, true)).returning({ id: s.boardMembers.id })).length;
      c.committees = (await tx.delete(s.committees).where(eq(s.committees.isDemo, true)).returning({ id: s.committees.id })).length;
      c.documents = (await tx.delete(s.documents).where(eq(s.documents.isDemo, true)).returning({ id: s.documents.id })).length;
      c.media = (await tx.delete(s.media).where(eq(s.media.isDemo, true)).returning({ id: s.media.id })).length;
      return c;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    await logActivity(user.id, "purged", "demo data", null, `${total} demo rows removed`);
    revalidate(["/", "/athletes", "/results", "/competitions", "/events", "/news", "/achievements", "/about", "/about/board", "/about/governance", "/about/documents", "/athletes/[slug]", "/news/[slug]", "/competitions/[slug]", "/events/[slug]"]);
    revalidatePath("/admin", "layout");
    return { ok: true, message: total ? `Purged ${total} demo rows (${Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`).join(", ")}).` : "There was no demo data left to purge." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}
