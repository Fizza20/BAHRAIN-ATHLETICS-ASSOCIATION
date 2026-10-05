"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn, formatDate, fullName } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";
import { DemoBadge, MedalDot, RecordTag } from "@/components/ui/badge";

export type ResultRow = {
  result: {
    id: number;
    position: number | null;
    mark: string | null;
    round: string;
    date: string;
    record: string | null;
    isSB: boolean;
    medal: "gold" | "silver" | "bronze" | null;
    notes: string | null;
    isDemo: boolean;
    sourceUrl: string | null;
  };
  athlete: { slug: string; firstName: string; lastName: string; category: string };
  discipline: { name: string; slug: string };
  competition: { slug: string; name: string; shortName: string | null; city: string | null } | null;
};

/**
 * Results as a table on desktop and tablet; each row becomes a stacked card on mobile.
 * Every row is clickable through to the athlete; secondary links sit above that click area.
 */
export function ResultsTable({
  rows,
  hide = [],
  caption,
}: {
  rows: ResultRow[];
  hide?: ("athlete" | "competition" | "discipline")[];
  caption?: string;
}) {
  const { t, locale } = useI18n();
  const secondary = "relative z-10 underline-offset-4 hover:text-brand-700 hover:underline";

  return (
    <div className="w-full">
      {/* Desktop / tablet */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full border-collapse text-start">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-pearl text-sm text-ink-600">
              <th scope="col" className="w-24 py-3 ps-5 pe-4 font-semibold">
                {t("table.place")}
              </th>
              {!hide.includes("athlete") && (
                <th scope="col" className="py-3 pe-4 font-semibold">
                  {t("table.athlete")}
                </th>
              )}
              {!hide.includes("discipline") && (
                <th scope="col" className="py-3 pe-4 font-semibold">
                  {t("table.event")}
                </th>
              )}
              {!hide.includes("competition") && (
                <th scope="col" className="py-3 pe-4 font-semibold">
                  {t("table.competition")}
                </th>
              )}
              <th scope="col" className="py-3 pe-4 text-end font-semibold">
                {t("table.mark")}
              </th>
              <th scope="col" className="w-36 py-3 pe-5 text-end font-semibold">
                {t("table.date")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ result: r, athlete, discipline, competition }) => (
              <tr key={r.id} className="group relative border-b border-line last:border-b-0 hover:bg-pearl">
                <td className="py-4 ps-5 pe-4 align-middle">
                  <Position n={r.position} medal={r.medal} />
                </td>
                {!hide.includes("athlete") && (
                  <td className="py-4 pe-4">
                    <Link href={`/athletes/${athlete.slug}`} className="font-semibold text-ink-950 after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700">
                      {fullName(athlete)}
                    </Link>
                    {r.isDemo && <DemoBadge className="ms-2 align-middle" />}
                  </td>
                )}
                {!hide.includes("discipline") && (
                  <td className="py-4 pe-4 text-ink-800">
                    <Link href={`/results?discipline=${discipline.slug}`} className={secondary}>
                      {discipline.name}
                    </Link>
                    {r.round !== "final" && <span className="ms-2 text-sm text-ink-600">{t(keyOf("round", r.round))}</span>}
                  </td>
                )}
                {!hide.includes("competition") && (
                  <td className="py-4 pe-4 text-ink-700">
                    {competition ? (
                      <Link href={`/competitions/${competition.slug}`} className={secondary}>
                        {competition.shortName ?? competition.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
                <td className="py-4 pe-4 text-end">
                  <span className="inline-flex items-center justify-end gap-2">
                    {r.record && <RecordTag record={r.record} />}
                    {r.isSB && (
                      <abbr title={t("common.sbTitle")} className="text-sm font-bold text-ink-600 no-underline">
                        {t("common.sb")}
                      </abbr>
                    )}
                    <span className={cn("text-xl text-mark text-ink-950", !r.mark && "text-base font-medium text-ink-600")}>{r.mark ?? t("common.tbc")}</span>
                  </span>
                </td>
                <td className="py-4 pe-5 text-end text-[0.9375rem] tabular text-ink-600">
                  <span className="inline-flex items-center gap-2">
                    {formatDate(r.date, undefined, locale)}
                    {r.sourceUrl && (
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 flex size-8 items-center justify-center rounded-xs text-ink-600 hover:bg-white hover:text-brand-700">
                        <ExternalLink className="size-4" aria-hidden />
                        <span className="sr-only">{t("common.sourceReport")}</span>
                      </a>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 md:hidden">
        {rows.map(({ result: r, athlete, discipline, competition }) => (
          <li key={r.id} className="card card-interactive relative flex items-start gap-4 p-4">
            <Position n={r.position} medal={r.medal} />
            <div className="min-w-0 flex-1">
              {!hide.includes("athlete") ? (
                <Link href={`/athletes/${athlete.slug}`} className="block font-semibold text-ink-950 after:absolute after:inset-0 after:content-['']">
                  {fullName(athlete)}
                  {r.isDemo && <DemoBadge className="ms-2 align-middle" />}
                </Link>
              ) : (
                <span className="block font-semibold text-ink-950">{discipline.name}</span>
              )}
              <span className="mt-0.5 block text-[0.9375rem] text-ink-700">
                {!hide.includes("athlete") && `${discipline.name} · `}
                {competition?.shortName ?? competition?.name ?? ""}
              </span>
              <span className="mt-0.5 block text-sm tabular text-ink-600">{formatDate(r.date, undefined, locale)}</span>
            </div>
            <div className="text-end">
              <span className={cn("block text-xl text-mark text-ink-950", !r.mark && "text-base font-medium text-ink-600")}>{r.mark ?? t("common.tbc")}</span>
              {r.record && <RecordTag record={r.record} className="mt-1" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Position({ n, medal }: { n: number | null; medal: "gold" | "silver" | "bronze" | null }) {
  const ring = medal === "gold" ? "ring-gold" : medal === "silver" ? "ring-silver" : medal === "bronze" ? "ring-bronze" : "ring-transparent";
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-base font-bold tabular ring-2 ring-offset-2 ring-offset-white",
        ring,
        n === 1 ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-900",
      )}
    >
      {n ?? "–"}
      {medal && <MedalDot medal={medal} label={false} className="absolute -end-2 -top-2" />}
    </span>
  );
}
