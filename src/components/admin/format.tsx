import { cn } from "@/lib/utils";

export function timeAgo(d: Date | null | undefined) {
  if (!d) return "—";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} d ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bahrain" }).format(d);
}

export function dateTime(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bahrain" }).format(d);
}

const ACTION_TONE: Record<string, string> = {
  created: "bg-success",
  updated: "bg-info",
  deleted: "bg-brand-600",
  published: "bg-gold",
  submitted: "bg-warning",
  login: "bg-ink-300",
  logout: "bg-ink-300",
  purged: "bg-brand-600",
};

export function ActionPill({ action }: { action: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold capitalize text-ink-800">
      <span className={cn("size-1.5 rounded-full", ACTION_TONE[action] ?? "bg-ink-400")} aria-hidden />
      {action}
    </span>
  );
}

export function actionDot(action: string) {
  return ACTION_TONE[action] ?? "bg-ink-400";
}
