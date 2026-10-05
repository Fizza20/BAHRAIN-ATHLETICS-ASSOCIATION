"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import type { LiveStatus } from "@/lib/status";
import { cn, dateParts, formatDateRange, formatTime } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";
import { RevealCard } from "@/components/ui/motion";

export type EventLike = {
  slug: string;
  title: string;
  type: string;
  startAt: string | null;
  endAt: string | null;
  location: string | null;
  live: LiveStatus;
  isDemo: boolean;
  competition?: { slug: string; name: string } | null;
};

const TYPES = ["participation", "championship", "training-camp", "meeting", "national", "community"];

/** Calendar card: date block on the left, details in the middle, the whole card is one link. */
export function EventRow({ e }: { e: EventLike }) {
  const { t, locale } = useI18n();
  const d = dateParts(e.startAt, locale);
  const time = formatTime(e.startAt, locale);
  return (
    <RevealCard>
    <article className="card card-interactive group relative flex items-center gap-4 p-4 sm:gap-6 sm:p-5">
      <div
        className={cn(
          "flex size-20 shrink-0 flex-col items-center justify-center rounded-sm text-center",
          e.live === "ongoing" ? "bg-brand-600 text-white" : "bg-pearl text-ink-950",
        )}
      >
        <span className="text-3xl font-extrabold leading-none tabular">{d.day}</span>
        <span className={cn("mt-1 text-sm font-semibold", e.live === "ongoing" ? "text-white" : "text-ink-600")}>
          {d.month} {d.year.slice(2)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={e.live} />
          <span className="text-sm font-medium text-ink-600">{TYPES.includes(e.type) ? t(keyOf("etype", e.type)) : e.type}</span>
          {e.isDemo && <DemoBadge />}
        </div>
        <h3 className="text-h3 text-ink-950">
          <Link href={`/events/${e.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {e.title}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9375rem] text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden /> {e.location ?? t("common.venueTbc")}
          </span>
          <span className="tabular">
            {formatDateRange(e.startAt?.slice(0, 10), e.endAt?.slice(0, 10), locale)}
            {time && ` · ${time}`}
          </span>
        </p>
      </div>
      <ChevronRight className="hidden size-5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600 sm:block" aria-hidden />
    </article>
    </RevealCard>
  );
}
