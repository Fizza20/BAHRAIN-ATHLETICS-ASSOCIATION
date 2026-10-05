"use server";

import { z } from "zod";
import { schema as s } from "@/db";
import { COMPETITION_STATUS, EVENT_TYPES } from "@/db/schema";
import { f, removeRows, saveRow, type ActionResult, type FormState } from "./helpers";

const schema = z
  .object({
    slug: f.slug(),
    title: f.str(160, "Title is required"),
    type: f.enum(EVENT_TYPES),
    competitionId: f.optId(),
    startAt: f.optDateTime(),
    endAt: f.optDateTime(),
    timeNote: f.optStr(120),
    location: f.optStr(160),
    city: f.optStr(80),
    country: f.optStr(80),
    status: f.enum(COMPETITION_STATUS),
    description: f.optStr(8000),
    isDemo: f.bool(),
    sourceUrl: f.optUrl(),
  })
  .refine((d) => !d.startAt || !d.endAt || d.endAt >= d.startAt, { path: ["endAt"], message: "End can’t be before the start" });

const paths = (slug?: unknown) => ["/", "/events", slug ? `/events/${slug}` : null];

export async function saveEvent(_: FormState, fd: FormData) {
  return saveRow(
    {
      resource: "events",
      table: s.events,
      schema,
      entity: "event",
      listPath: "/admin/events",
      label: (d) => d.title,
      paths: (d, old) => [...paths(d.slug), old && `/events/${old.slug}`],
      unique: { column: "slug", field: "slug", message: "Another event already uses this slug." },
      hasUpdatedAt: true,
    },
    fd,
  );
}

const del = { resource: "events" as const, table: s.events, entity: "event", label: (r: Record<string, unknown>) => String(r.title), paths: (rows: Record<string, unknown>[]) => [...paths(), ...rows.map((r) => `/events/${r.slug}`), "/admin/events"] };

export async function deleteEvent(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteEvents(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
