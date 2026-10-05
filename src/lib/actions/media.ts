"use server";

import { z } from "zod";
import { schema as s } from "@/db";
import { db } from "@/db";
import { assertCan, logActivity } from "@/lib/auth";
import { errorMessage, f, parseForm, removeRows, revalidate, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  title: f.str(120, "Title is required"),
  url: z
    .string({ error: "Image URL is required" })
    .trim()
    .min(1, "Image URL is required")
    .max(2000)
    .regex(/^https:\/\/\S+$/, "Use a full https:// address"),
  alt: f.str(300, "Alt text is required: describe the image for screen-reader users"),
  credit: f.optStr(160),
  kind: f.enum(["image", "video", "document"] as const),
  tags: f.optStr(200),
});

/** Adds a media item by URL. Returns state (the media page stays open and shows a toast). */
export async function addMedia(_: FormState, fd: FormData): Promise<FormState> {
  let user;
  try {
    user = await assertCan("media", "write");
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  const parsed = parseForm(schema, fd);
  if (!parsed.ok) return parsed.state;
  const [row] = await db.insert(s.media).values({ ...parsed.data, isDemo: false }).returning({ id: s.media.id });
  await logActivity(user.id, "created", "media", row.id, parsed.data.title);
  revalidate(["/admin/media"]);
  return { ok: true, message: `“${parsed.data.title}” added to the library.` };
}

const del = { resource: "media" as const, table: s.media, entity: "media", label: (r: Record<string, unknown>) => String(r.title), paths: () => ["/admin/media"] };
export async function deleteMedia(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteMedia(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
