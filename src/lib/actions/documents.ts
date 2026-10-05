"use server";

import { z } from "zod";
import { schema as s } from "@/db";
import { DOCUMENT_CATEGORIES } from "@/db/schema";
import { f, removeRows, saveRow, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  title: f.str(200, "Title is required"),
  description: f.optStr(2000),
  category: f.enum(DOCUMENT_CATEGORIES),
  url: f.optUrl(),
  fileType: f.optStr(20),
  publishedAt: f.optDate(),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

const paths = ["/about/documents", "/about/governance", "/clean-athletics"];

export async function saveDocument(_: FormState, fd: FormData) {
  return saveRow({ resource: "documents", table: s.documents, schema, entity: "document", listPath: "/admin/documents", label: (d) => d.title, paths: () => paths }, fd);
}

const del = { resource: "documents" as const, table: s.documents, entity: "document", label: (r: Record<string, unknown>) => String(r.title), paths: () => [...paths, "/admin/documents"] };
export async function deleteDocument(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteDocuments(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}
