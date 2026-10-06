import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCompetitions } from "@/lib/queries";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/ui/photo";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/utils";
import { photos } from "@/lib/images";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("comp.meta.title"),
    description: t("comp.meta.desc"),
    alternates: { canonical: "/competitions" },
  };
}

const TABS = [
  { value: "", key: "filter.all" },
  { value: "upcoming", key: "status.upcoming" },
  { value: "ongoing", key: "ev.tab.ongoing" },
  { value: "completed", key: "status.completed" },
  { value: "postponed", key: "status.postponed" },
] as const;

export default async function CompetitionsPage({ searchParams }: PageProps<"/competitions">) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const level = typeof sp.level === "string" ? sp.level : "";
  let rows = await getCompetitions(status || undefined);
  if (level) rows = rows.filter((r) => r.competition.level === level);
  const [first, ...rest] = rows;

  const href = (k: string, v: string) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(level && { level }) });
    if (v) p.set(k, v);
    else p.delete(k);
    const qs = p.toString();
    return qs ? `/competitions?${qs}` : "/competitions";
  };

  return (
    <>
      <PageHero
        eyebrow={t("comp.eyebrow")}
        title={t("comp.title")}
        intro={t("comp.intro")}
        crumbs={[{ label: t("comp.title") }]}
        image={photos.stadiumSeats.src}
      />
      <div className="sticky top-16 sm:top-[72px] z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label={t("comp.filterStatus")} className="scrollbar-none flex gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <Link key={tab.value} href={href("status", tab.value)} scroll={false} aria-current={status === tab.value ? "page" : undefined} className="tab-pill">
                {t(tab.key)}
              </Link>
            ))}
          </nav>
          <nav aria-label={t("comp.filterLevel")} className="scrollbar-none flex gap-2 overflow-x-auto">
            {["", "global", "continental", "regional", "national", "meeting"].map((l) => (
              <Link key={l} href={href("level", l)} scroll={false} aria-current={level === l ? "page" : undefined} className="tab-pill">
                {l ? t(keyOf("level", l)) : t("comp.everyLevel")}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="container-x section-y">
        {first && (
          <article className="card card-interactive relative grid overflow-hidden lg:grid-cols-12">
            <div className="relative min-h-[240px] bg-ink-100 lg:col-span-5">
              <Photo src={first.competition.imageUrl} alt="" sizes="(min-width:1024px) 40vw, 100vw" />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={first.live} />
                <span className="text-eyebrow text-ink-500">{t(keyOf("level", first.competition.level))}</span>
                {first.competition.isDemo && <DemoBadge />}
              </div>
              <h2 className="text-h2 mt-4 text-ink-950">
                <Link href={`/competitions/${first.competition.slug}`} className="after:absolute after:inset-0 after:content-['']">
                  {first.competition.name}
                </Link>
              </h2>
              <p className="mt-2 text-ink-600">
                {first.competition.city}, {first.competition.country} · {formatDateRange(first.competition.startDate, first.competition.endDate, locale)}
              </p>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
                {[
                  [t("comp.stat.athletes"), first.athletes],
                  [t("comp.stat.results"), first.results],
                  [t("comp.stat.medals"), first.medals],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm text-ink-600">{k}</dt>
                    <dd className="mt-1 text-3xl text-mark text-ink-950">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        )}

        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((r) => (
            <li key={r.competition.id} className="card card-interactive relative flex flex-col overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
                <Photo src={r.competition.imageUrl} alt="" sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" />
                <div className="absolute start-4 top-4 flex gap-2">
                  <StatusBadge status={r.live} className="bg-white" />
                  {r.competition.isDemo && <DemoBadge className="bg-white" />}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-eyebrow text-ink-500">
                  {t(keyOf("level", r.competition.level))} · {r.competition.city ?? t("common.tbc")}, {r.competition.country}
                </p>
                <h2 className="text-h3 mt-3 text-ink-950">
                  <Link href={`/competitions/${r.competition.slug}`} className="after:absolute after:inset-0 after:content-['']">
                    {r.competition.name}
                  </Link>
                </h2>
                <p className="mt-2 text-[0.9375rem] tabular text-ink-600">{formatDateRange(r.competition.startDate, r.competition.endDate, locale)}</p>
                <div className="mt-auto flex items-center justify-between pt-5 text-[0.9375rem]">
                  <span className="text-ink-600">
                    {r.results > 0 ? (
                      <>
                        <strong className="text-ink-950">{r.results}</strong> {t("comp.cardResults")} · <strong className="text-ink-950">{r.medals}</strong> {t("comp.cardMedals")}
                      </>
                    ) : (
                      t("comp.resultsToFollow")
                    )}
                  </span>
                  <ArrowUpRight className="size-5 text-ink-500" aria-hidden />
                </div>
              </div>
            </li>
          ))}
        </ul>
        {rows.length === 0 && <p className="mt-10 text-ink-600">{t("comp.empty")}</p>}
      </div>
    </>
  );
}
