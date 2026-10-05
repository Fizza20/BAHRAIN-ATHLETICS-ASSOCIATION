export type LiveStatus = "upcoming" | "ongoing" | "completed" | "postponed" | "cancelled";

/**
 * Status derived from dates so the calendar never goes stale. Postponed/cancelled
 * are editorial decisions and always win over dates.
 */
export function effectiveStatus(
  stored: string,
  start?: string | null,
  end?: string | null,
  now = new Date(),
): LiveStatus {
  if (stored === "postponed" || stored === "cancelled") return stored;
  if (!start) return stored as LiveStatus;
  const s = new Date(start.length === 10 ? `${start}T00:00:00+03:00` : start);
  const e = end ? new Date(end.length === 10 ? `${end}T23:59:59+03:00` : end) : new Date(s.getTime() + 86_399_000);
  if (now < s) return "upcoming";
  if (now > e) return "completed";
  return "ongoing";
}

export const STATUS_LABEL: Record<LiveStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Live now",
  completed: "Completed",
  postponed: "Postponed",
  cancelled: "Cancelled",
};
