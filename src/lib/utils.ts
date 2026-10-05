import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { INTL_TAG, type Locale } from "@/lib/i18n/config";

// Teach tailwind-merge about our type-scale utilities so `text-h2 text-white`
// isn't collapsed as two conflicting colour classes.
const twMerge = extendTailwindMerge<"baa-mark">({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "eyebrow"] }],
      "baa-mark": ["text-mark"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = "Asia/Bahrain";
const tag = (l: Locale) => INTL_TAG[l];
const TBC: Record<Locale, string> = { en: "TBC", ar: "يُحدد لاحقًا" };

export function formatDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }, locale: Locale = "en") {
  if (!iso) return TBC[locale];
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00+03:00` : iso);
  if (Number.isNaN(d.getTime())) return TBC[locale];
  return new Intl.DateTimeFormat(tag(locale), { timeZone: TZ, ...opts }).format(d);
}

export function formatDateRange(start?: string | null, end?: string | null, locale: Locale = "en") {
  if (!start) return locale === "ar" ? "التواريخ تُحدد لاحقًا" : "Dates TBC";
  if (!end || end.slice(0, 10) === start.slice(0, 10)) return formatDate(start, undefined, locale);
  const s = new Date(`${start.slice(0, 10)}T12:00:00Z`);
  const e = new Date(`${end.slice(0, 10)}T12:00:00Z`);
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}–${formatDate(end, undefined, locale)}`;
  }
  if (s.getUTCFullYear() === e.getUTCFullYear()) {
    return `${formatDate(start, { day: "numeric", month: "short" }, locale)} – ${formatDate(end, undefined, locale)}`;
  }
  return `${formatDate(start, undefined, locale)} – ${formatDate(end, undefined, locale)}`;
}

export function formatTime(iso?: string | null, locale: Locale = "en") {
  if (!iso || iso.length <= 10) return null;
  const d = new Date(iso);
  if (d.getUTCHours() === 21 && d.getUTCMinutes() === 0) return null; // midnight local placeholder
  return new Intl.DateTimeFormat(tag(locale), { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
}

export function dateParts(iso?: string | null, locale: Locale = "en") {
  if (!iso) return { day: "—", month: TBC[locale], year: "" };
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00+03:00` : iso);
  return {
    day: new Intl.DateTimeFormat(tag(locale), { timeZone: TZ, day: "2-digit" }).format(d),
    month: new Intl.DateTimeFormat(tag(locale), { timeZone: TZ, month: "short" }).format(d),
    year: new Intl.DateTimeFormat(tag(locale), { timeZone: TZ, year: "numeric" }).format(d),
  };
}

export function ordinal(n?: number | null, locale: Locale = "en") {
  if (!n) return "—";
  if (locale === "ar") return String(n);
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function fullName(a: { firstName: string; lastName: string }) {
  return `${a.firstName} ${a.lastName}`;
}

export function initials(a: { firstName: string; lastName: string }) {
  return `${a.firstName[0] ?? ""}${a.lastName[0] ?? ""}`.toUpperCase();
}

export const CATEGORY_LABEL: Record<string, string> = {
  senior: "Senior",
  u23: "U23",
  u20: "U20",
  u18: "U18",
  u16: "U16",
};

export const NEWS_CATEGORY_LABEL: Record<string, string> = {
  athletes: "Athletes",
  competitions: "Competitions",
  achievements: "Achievements",
  federation: "Federation",
  international: "International",
  development: "Development",
};

export const LEVEL_LABEL: Record<string, string> = {
  global: "Global",
  continental: "Continental",
  regional: "Regional",
  national: "National",
  meeting: "Meeting",
};

export const ROUND_LABEL: Record<string, string> = {
  final: "Final",
  "semi-final": "Semi-final",
  heat: "Heat",
  qualification: "Qualification",
  single: "—",
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
