"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutList, CalendarDays } from "lucide-react";
import { EventRow, type EventLike } from "./event-row";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";
import { INTL_TAG } from "@/lib/i18n/config";

const TABS = ["upcoming", "ongoing", "completed", "postponed"] as const;

export function EventsExplorer({ events, initialTab = "upcoming" }: { events: EventLike[]; initialTab?: string }) {
  const { t } = useI18n();
  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState<"list" | "month">("list");
  const counts = Object.fromEntries(TABS.map((k) => [k, events.filter((e) => e.live === k).length]));
  const list = useMemo(() => {
    const l = events.filter((e) => e.live === tab);
    return tab === "completed" ? [...l].sort((a, b) => (b.startAt ?? "").localeCompare(a.startAt ?? "")) : l;
  }, [events, tab]);

  return (
    <div>
      <div className="sticky top-[72px] z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-4 backdrop-blur md:mx-0 md:px-0">
        <div role="tablist" aria-label={t("ev.status")} className="scrollbar-none flex gap-2 overflow-x-auto">
          {TABS.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k && view === "list"}
              onClick={() => {
                setTab(k);
                setView("list");
              }}
              className="tab-pill"
            >
              {t(keyOf("ev.tab", k))}
              <span className="tabular opacity-80">{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2" role="group" aria-label={t("ev.view")}>
          <button onClick={() => setView("list")} aria-pressed={view === "list"} className="tab-pill">
            <LayoutList className="size-4" aria-hidden /> {t("ev.list")}
          </button>
          <button onClick={() => setView("month")} aria-pressed={view === "month"} className="tab-pill">
            <CalendarDays className="size-4" aria-hidden /> {t("ev.month")}
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="mt-6 space-y-3">
          {list.length ? list.map((e) => <EventRow key={e.slug} e={e} />) : <p className="py-16 text-center text-ink-600">{t("ev.nothing")}</p>}
        </div>
      ) : (
        <MonthGrid events={events} />
      )}
    </div>
  );
}

function MonthGrid({ events }: { events: EventLike[] }) {
  const { t, locale } = useI18n();
  const firstUpcoming = events.find((e) => e.live === "upcoming" && e.startAt);
  const seed = firstUpcoming?.startAt ? new Date(firstUpcoming.startAt) : new Date();
  const [cursor, setCursor] = useState(new Date(Date.UTC(seed.getUTCFullYear(), seed.getUTCMonth(), 1)));
  const y = cursor.getUTCFullYear();
  const m = cursor.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7; // Monday first
  const label = new Intl.DateTimeFormat(INTL_TAG[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(cursor);

  const dayEvents = (d: number) => {
    const day = Date.UTC(y, m, d);
    return events.filter((e) => {
      if (!e.startAt) return false;
      const s = Date.parse(e.startAt.slice(0, 10) + "T00:00:00Z");
      const en = e.endAt ? Date.parse(e.endAt.slice(0, 10) + "T00:00:00Z") : s;
      return day >= s && day <= en;
    });
  };
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h3" aria-live="polite">
          {label}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCursor(new Date(Date.UTC(y, m - 1, 1)))} className="flex size-11 items-center justify-center rounded-xs border border-line bg-white hover:border-ink-900" aria-label={t("ev.prevMonth")}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button onClick={() => setCursor(new Date(Date.UTC(y, m + 1, 1)))} className="flex size-11 items-center justify-center rounded-xs border border-line bg-white hover:border-ink-900" aria-label={t("ev.nextMonth")}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-line bg-line">
        {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
          <div key={d} className="bg-pearl px-1 py-3 text-center text-xs font-semibold text-ink-600 sm:text-sm">
            {t(keyOf("weekday", d))}
          </div>
        ))}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`o${i}`} className="min-h-20 bg-pearl/60 md:min-h-28" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const ev = dayEvents(d);
          const key = new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
          return (
            <div key={d} className="min-h-20 bg-white p-1.5 md:min-h-28 md:p-2">
              <span className={cn("inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular", key === todayKey ? "bg-brand-600 text-white" : "text-ink-600")}>{d}</span>
              <ul className="mt-1 space-y-1">
                {ev.slice(0, 2).map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/events/${e.slug}`}
                      className={cn(
                        "block truncate rounded-xs px-1.5 py-1 text-xs font-semibold leading-tight",
                        e.live === "ongoing" ? "bg-brand-600 text-white" : e.live === "upcoming" ? "bg-brand-50 text-brand-800 hover:bg-brand-100" : "bg-ink-100 text-ink-700 hover:bg-ink-200",
                      )}
                      title={e.title}
                    >
                      {e.title}
                    </Link>
                  </li>
                ))}
                {ev.length > 2 && <li className="px-1 text-xs text-ink-600">{t("ev.more", { n: ev.length - 2 })}</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
