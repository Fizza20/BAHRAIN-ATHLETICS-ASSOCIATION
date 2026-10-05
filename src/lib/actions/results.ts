"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { MEDALS, RECORDS, ROUNDS } from "@/db/schema";
import { parseMark } from "@/lib/marks";
import { f, removeRows, saveRow, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  athleteId: f.id("Choose an athlete"),
  competitionId: f.optId(),
  disciplineId: f.id("Choose a discipline"),
  round: f.enum(ROUNDS),
  position: f.optInt(1, 999),
  mark: f.optStr(20).refine((v) => !v || parseMark(v) !== null, "Use a mark like 10.12, 1:45.30 or 8.05"),
  wind: f.optStr(10),
  date: f.date(),
  record: f.optEnum(RECORDS),
  isSB: f.bool(),
  medal: f.optEnum(MEDALS),
  notes: f.optStr(2000),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

export async function saveResult(_: FormState, fd: FormData) {
  let label = "Result";
  let slug: string | undefined;
  return saveRow(
    {
      resource: "results",
      table: s.results,
      schema,
      entity: "result",
      listPath: "/admin/results",
      label: () => label,
      paths: (_d, old) => ["/", "/results", "/athletes", slug && `/athletes/${slug}`, old && "/competitions"],
      prepare: async (d) => {
        const [a] = await db.select().from(s.athletes).where(eq(s.athletes.id, d.athleteId));
        if (!a) return { ok: false, message: "Please fix the highlighted fields.", errors: { athleteId: "That athlete no longer exists" } };
        const [dis] = await db.select().from(s.disciplines).where(eq(s.disciplines.id, d.disciplineId));
        if (!dis) return { ok: false, message: "Please fix the highlighted fields.", errors: { disciplineId: "Unknown discipline" } };
        slug = a.slug;
        label = `${a.lastName}, ${dis.name}${d.mark ? `, ${d.mark}` : ""}${d.record ? ` ${d.record}` : ""}`;
        return { ...d, markValue: parseMark(d.mark) };
      },
    },
    fd,
  );
}

const del = {
  resource: "results" as const,
  table: s.results,
  entity: "result",
  label: (r: Record<string, unknown>) => `${r.mark ?? "Result"} on ${r.date}`,
  paths: () => ["/", "/results", "/athletes", "/athletes/[slug]", "/competitions", "/competitions/[slug]", "/admin/results"],
};

export async function deleteResult(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteResults(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
