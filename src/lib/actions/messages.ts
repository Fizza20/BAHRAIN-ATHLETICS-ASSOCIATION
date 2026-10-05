"use server";

import { inArray } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { assertCan } from "@/lib/auth";
import { errorMessage, parseIds, removeRows, revalidate, type ActionResult } from "./helpers";

async function setRead(raw: number[], read: boolean): Promise<ActionResult> {
  try {
    await assertCan("messages", "write");
    const ids = parseIds(raw);
    const rows = await db.update(s.messages).set({ read }).where(inArray(s.messages.id, ids)).returning({ id: s.messages.id });
    revalidate(["/admin/messages", "/admin"]);
    return { ok: true, message: `${rows.length} message(s) marked as ${read ? "read" : "unread"}.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function markMessagesRead(ids: number[]) {
  return setRead(ids, true);
}
export async function markMessagesUnread(ids: number[]) {
  return setRead(ids, false);
}

const del = {
  resource: "messages" as const,
  table: s.messages,
  entity: "message",
  label: (r: Record<string, unknown>) => `Message from ${r.firstName} ${r.lastName}`,
  paths: () => ["/admin/messages", "/admin"],
};
export async function deleteMessage(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteMessages(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
