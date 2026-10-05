"use server";

import { z } from "zod";
import { schema as s } from "@/db";
import { COMPETITION_LEVEL, COMPETITION_STATUS } from "@/db/schema";
import { f, removeRows, saveRow, type ActionResult, type FormState } from "./helpers";

const schema = z
  .object({
    slug: f.slug(),
    name: f.str(160, "Name is required"),
    shortName: f.optStr(60),
    level: f.enum(COMPETITION_LEVEL),
    city: f.optStr(80),
    country: f.optStr(80),
    venue: f.optStr(160),
    startDate: f.optDate(),
    endDate: f.optDate(),
    status: f.enum(COMPETITION_STATUS),
    description: f.optStr(8000),
    imageUrl: f.optUrl(),
    isDemo: f.bool(),
    sourceUrl: f.optUrl(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { path: ["endDate"], message: "End date can’t be before the start date" });

const paths = (slug?: unknown) => ["/", "/competitions", slug ? `/competitions/${slug}` : null, "/results", "/events"];

export async function saveCompetition(_: FormState, fd: FormData) {
  return saveRow(
    {
      resource: "competitions",
      table: s.competitions,
      schema,
      entity: "competition",
      listPath: "/admin/competitions",
      label: (d) => d.name,
      paths: (d, old) => [...paths(d.slug), old && `/competitions/${old.slug}`],
      unique: { column: "slug", field: "slug", message: "Another competition already uses this slug." },
      hasUpdatedAt: true,
    },
    fd,
  );
}

const del = { resource: "competitions" as const, table: s.competitions, entity: "competition", label: (r: Record<string, unknown>) => String(r.name), paths: (rows: Record<string, unknown>[]) => [...paths(), ...rows.map((r) => `/competitions/${r.slug}`), "/admin/competitions"] };

export async function deleteCompetition(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteCompetitions(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
