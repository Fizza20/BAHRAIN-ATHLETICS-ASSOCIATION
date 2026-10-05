import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Trophy } from "lucide-react";
import { getEventBySlug } from "@/lib/queries";
import { PageHero } from "@/components/site/page-hero";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ResultsTable } from "@/components/domain/results-table";
import { formatDateRange, formatTime } from "@/lib/utils";
import { photos } from "@/lib/images";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { t } = await getT();
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: t("events.notFound") };
  return {
    title: e.title,
    description: e.description ?? `${e.title}, ${e.location}`,
    alternates: { canonical: `/events/${e.slug}` },
    robots: e.isDemo ? { index: false } : undefined,
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { t, locale } = await getT();
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) notFound();
  const time = formatTime(e.startAt, locale);
  const results = e.competition?.results ?? [];
  const typeLabel = ["participation", "championship", "training-camp", "meeting", "national", "community"].includes(e.type)
    ? t(keyOf("events.type", e.type))
    : t("events.type.default");

  return (
    <>
      <PageHero
        eyebrow={typeLabel}
        title={e.title}
        crumbs={[{ label: t("events.crumb"), href: "/events" }, { label: e.title }]}
        image={e.competition?.imageUrl ?? photos.stadium.src}
      >
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <StatusBadge status={e.live} />
          {e.isDemo && <DemoBadge />}
        </div>
      </PageHero>

      <div className="container-x section-y grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {e.description && <p className="text-lg leading-relaxed text-ink-700">{e.description}</p>}
          {e.sourceUrl && (
            <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
              <ExternalLink className="size-3.5" aria-hidden /> {t("events.source")}
            </a>
          )}

          <section aria-labelledby="ev-results" className="mt-12">
            <h2 id="ev-results" className="text-h2 mb-6">
              {e.live === "completed" ? t("events.bahrainResults") : t("events.results")}
            </h2>
            {results.length ? (
              <ResultsTable rows={results.map((r) => ({ result: r, athlete: r.athlete, discipline: r.discipline, competition: null }))} hide={["competition"]} caption={t("events.resultsCaption")} />
            ) : (
              <p className="rounded-md border border-dashed border-ink-300 bg-pearl p-8 text-ink-600">
                {e.live === "upcoming" ? t("events.empty.upcoming") : e.live === "postponed" ? t("events.empty.postponed") : t("events.empty.none")}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <dl className="card divide-y divide-line">
            {[
              [CalendarDays, t("events.dates"), formatDateRange(e.startAt?.slice(0, 10), e.endAt?.slice(0, 10), locale)],
              ...(time ? [[Clock, t("events.startTime"), t("events.bahrainTime", { time })] as const] : []),
              [MapPin, t("events.location"), e.location ?? t("common.tbc")],
              [Trophy, t("events.typeLabel"), typeLabel],
            ].map(([Icon, k, v]) => {
              const I = Icon as typeof CalendarDays;
              return (
                <div key={k as string} className="flex gap-4 p-5">
                  <I className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <div>
                    <dt className="text-eyebrow text-ink-500">{k as string}</dt>
                    <dd className="mt-1.5 font-semibold">{v as string}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
          {e.competition && (
            <div className="card p-6">
              <p className="text-eyebrow text-ink-500">{t("events.hub")}</p>
              <p className="text-h3 mt-3">{e.competition.name}</p>
              <ButtonLink href={`/competitions/${e.competition.slug}`} variant="primary" size="sm" className="mt-5">
                {t("events.openHub")}
              </ButtonLink>
            </div>
          )}
          <Link href="/events" className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700 hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> {t("events.back")}
          </Link>
        </aside>
      </div>
    </>
  );
}
