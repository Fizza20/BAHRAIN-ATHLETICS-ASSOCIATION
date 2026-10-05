import type { Role } from "@/db/schema";

/**
 * Permission matrix. The UI hides what a role can't do, but every server action
 * and admin page re-checks with `can()`. The UI is never the security boundary.
 */
export const RESOURCES = [
  "athletes",
  "competitions",
  "events",
  "results",
  "news",
  "media",
  "achievements",
  "governance",
  "documents",
  "messages",
  "users",
  "settings",
  "activity",
] as const;
export type Resource = (typeof RESOURCES)[number];
export type Action = "read" | "write" | "delete" | "publish";

type Grant = Partial<Record<Resource, Action[]>>;
const ALL: Action[] = ["read", "write", "delete", "publish"];

const MATRIX: Record<Role, Grant | "*"> = {
  super_admin: "*",
  administrator: Object.fromEntries(
    RESOURCES.filter((r) => r !== "users" && r !== "settings").map((r) => [r, ALL]),
  ) as Grant,
  content_manager: {
    news: ALL,
    media: ALL,
    achievements: ALL,
    athletes: ["read"],
    competitions: ["read"],
    activity: ["read"],
  },
  results_manager: {
    results: ALL,
    athletes: ["read", "write"],
    competitions: ["read"],
    achievements: ["read", "write"],
    activity: ["read"],
  },
  event_manager: {
    events: ALL,
    competitions: ALL,
    results: ["read"],
    activity: ["read"],
  },
  editor: {
    news: ["read", "write"], // drafts only, cannot publish or delete
    media: ["read", "write"],
    athletes: ["read"],
    competitions: ["read"],
  },
};

export function can(role: Role | undefined | null, resource: Resource, action: Action = "read") {
  if (!role) return false;
  const grant = MATRIX[role];
  if (grant === "*") return true;
  return grant[resource]?.includes(action) ?? false;
}

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  content_manager: "Content Manager",
  results_manager: "Results Manager",
  event_manager: "Event Manager",
  editor: "Editor",
};

export const ROLE_SUMMARY: Record<Role, string> = {
  super_admin: "Full access, including users and platform settings.",
  administrator: "All content, governance, documents and messages.",
  content_manager: "News, media and achievements. Can publish.",
  results_manager: "Results and athlete performance data.",
  event_manager: "Events and competitions.",
  editor: "Writes news drafts and submits them for review.",
};

export function matrixFor(role: Role) {
  return RESOURCES.map((r) => ({
    resource: r,
    read: can(role, r, "read"),
    write: can(role, r, "write"),
    delete: can(role, r, "delete"),
    publish: can(role, r, "publish"),
  }));
}
