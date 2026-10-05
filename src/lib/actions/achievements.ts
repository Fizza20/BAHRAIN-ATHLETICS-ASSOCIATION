"use server";

import { z } from "zod";
import { schema as s } from "@/db";
import { MEDALS } from "@/db/schema";
import { f, removeRows, saveRow, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  title: f.str(200, "Title is required"),
  description: f.optStr(4000),
  year: f.int(1950, 2100),
  date: f.optDate(),
  type: f.enum(["medal", "record", "title", "milestone"] as const),
  medal: f.optEnum(MEDALS),
  athleteId: f.optId(),
  competitionId: f.optId(),
  featured: f.bool(),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

const paths = ["/", "/achievements", "/athletes/[slug]"];

export async function saveAchievement(_: FormState, fd: FormData) {
  return saveRow(
    { resource: "achievements", table: s.achievements, schema, entity: "achievement", listPath: "/admin/achievements", label: (d) => d.title, paths: () => paths },
    fd,
  );
}

const del = { resource: "achievements" as const, table: s.achievements, entity: "achievement", label: (r: Record<string, unknown>) => String(r.title), paths: () => [...paths, "/admin/achievements"] };
export async function deleteAchievement(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteAchievements(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
