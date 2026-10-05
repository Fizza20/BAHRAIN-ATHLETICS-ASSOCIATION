"use server";

import { z } from "zod";
import { schema as s } from "@/db";
import { f, removeRows, saveRow, type ActionResult, type FormState } from "./helpers";

const boardSchema = z.object({
  name: f.str(120, "Name is required"),
  title: f.str(160, "Title is required"),
  group: f.enum(["executive", "committee", "administration"] as const),
  sortOrder: f.int(0, 9999).default(0),
  imageUrl: f.optUrl(),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

const committeeSchema = z.object({
  name: f.str(160, "Name is required"),
  chair: f.optStr(120),
  remit: f.optStr(4000),
  sortOrder: f.int(0, 9999).default(0),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

const boardPaths = ["/about", "/about/board", "/admin/governance"];
const committeePaths = ["/about/governance", "/admin/governance"];

export async function saveBoardMember(_: FormState, fd: FormData) {
  return saveRow(
    { resource: "governance", table: s.boardMembers, schema: boardSchema, entity: "board member", listPath: "/admin/governance", label: (d) => d.name, paths: () => boardPaths },
    fd,
  );
}

export async function saveCommittee(_: FormState, fd: FormData) {
  return saveRow(
    { resource: "governance", table: s.committees, schema: committeeSchema, entity: "committee", listPath: "/admin/governance?tab=committees", label: (d) => d.name, paths: () => committeePaths },
    fd,
  );
}

const label = (r: Record<string, unknown>) => String(r.name);
export async function deleteBoardMember(id: number): Promise<ActionResult> {
  return removeRows({ resource: "governance", table: s.boardMembers, entity: "board member", label, paths: () => boardPaths }, id);
}
export async function bulkDeleteBoardMembers(ids: number[]): Promise<ActionResult> {
  return removeRows({ resource: "governance", table: s.boardMembers, entity: "board member", label, paths: () => boardPaths }, ids);
}
export async function deleteCommittee(id: number): Promise<ActionResult> {
  return removeRows({ resource: "governance", table: s.committees, entity: "committee", label, paths: () => committeePaths }, id);
}
export async function bulkDeleteCommittees(ids: number[]): Promise<ActionResult> {
  return removeRows({ resource: "governance", table: s.committees, entity: "committee", label, paths: () => committeePaths }, ids);
}
