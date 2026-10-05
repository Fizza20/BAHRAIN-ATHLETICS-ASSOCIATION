import type { Resource } from "@/lib/permissions";

export type AdminNavItem = { href: string; label: string; resource: Resource | null; icon: IconKey };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export type IconKey =
  | "overview"
  | "athletes"
  | "competitions"
  | "events"
  | "results"
  | "achievements"
  | "news"
  | "media"
  | "governance"
  | "documents"
  | "messages"
  | "users"
  | "settings"
  | "activity";

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Overview", resource: null, icon: "overview" }] },
  {
    label: "Sports data",
    items: [
      { href: "/admin/athletes", label: "Athletes", resource: "athletes", icon: "athletes" },
      { href: "/admin/competitions", label: "Competitions", resource: "competitions", icon: "competitions" },
      { href: "/admin/events", label: "Events", resource: "events", icon: "events" },
      { href: "/admin/results", label: "Results", resource: "results", icon: "results" },
      { href: "/admin/achievements", label: "Achievements", resource: "achievements", icon: "achievements" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/news", label: "News", resource: "news", icon: "news" },
      { href: "/admin/media", label: "Media", resource: "media", icon: "media" },
    ],
  },
  {
    label: "Federation",
    items: [
      { href: "/admin/governance", label: "Governance", resource: "governance", icon: "governance" },
      { href: "/admin/documents", label: "Documents", resource: "documents", icon: "documents" },
      { href: "/admin/messages", label: "Messages", resource: "messages", icon: "messages" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/users", label: "Users", resource: "users", icon: "users" },
      { href: "/admin/settings", label: "Settings", resource: "settings", icon: "settings" },
      { href: "/admin/activity", label: "Activity", resource: "activity", icon: "activity" },
    ],
  },
];

export const SEGMENT_LABEL: Record<string, string> = {
  admin: "Overview",
  athletes: "Athletes",
  competitions: "Competitions",
  events: "Events",
  results: "Results",
  achievements: "Achievements",
  news: "News",
  media: "Media",
  governance: "Governance",
  board: "Board member",
  committees: "Committee",
  documents: "Documents",
  messages: "Messages",
  users: "Users",
  settings: "Settings",
  activity: "Activity",
  search: "Search",
  new: "New",
};
