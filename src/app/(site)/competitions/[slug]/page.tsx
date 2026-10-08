import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, FileText, MapPin } from "lucide-react";
import { getCompetitionBySlug } from "@/lib/queries";
import { Breadcrumbs, EmptyState } from "@/components/site/page-hero";
import { Photo } from "@/components/ui/photo";
import { DemoBadge, MedalDot, StatusBadge } from "@/components/ui/badge";
import { ResultsTable } from "@/components/domain/results-table";
import { StoryCard } from "@/components/domain/news-story";
import { formatDate, formatDateRange, fullName, SITE_URL } from "@/lib/utils";
import { photos } from "@/lib/images";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";
import { jsonLd as jsonLdScript } from "@/lib/security/json-ld";

export async function generateMetadata({ params }: PageProps<"/competitions/[slug]">): Promise<Metadata> {
  const { t } = await getT();
  const { slug } = await params;
  const c = await getCompetitionBySlug(slug);
  if (!c) return { title: t("comp.notFound") };
  return {
    title: c.name,
    description: t("comp.metaDesc", { name: c.name, city: c.city ?? "", country: c.country ?? "" }),
    alternates: { canonical: `/competitions/${c.slug}` },
    robots: c.isDemo ? { index: false } : undefined,
  };
}

export default async function CompetitionPage({ params }: PageProps<"/competitions/[slug]">) {
  const { t, locale } = await getT();
  const { slug } = await params;
  const c = await getCompetitionBySlug(slug);
  if (!c) notFound();

  const byDiscipline = c.disciplines.map((d) => ({
    discipline: d,
    rows: c.results.filter((r) => r.disciplineId === d.id).map((r) => ({ result: r, athlete: r.athlete, discipline: r.discipline, competition: null })),
  }));
  const medalists = c.results.filter((r) => r.medal);
  const gallery = [c.imageUrl, photos.trackRunner.src, photos.lanes.src, photos.stadiumView.src].filter(Boolean) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: c.name,
    sport: "Athletics",
    startDate: c.startDate,
    endDate: c.endDate,
    eventStatus: c.live === "postponed" ? "https://schema.org/EventPostponed" : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: c.venue ?? c.city, address: { "@type": "PostalAddress", addressLocality: c.city, addressCountry: c.country } },
    url: `${SITE_URL}/competitions/${c.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <section className="under-header border-b border-line bg-pearl">
        <div className="container-x py-8 md:py-12">
          <Breadcrumbs items={[{ label: t("nav.competitions"), href: "/competitions" }, { label: c.shortName ?? c.name }]} />
          <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={c.live} />
                <span className="text-eyebrow text-ink-500">{t(keyOf("level", c.level))}</span>
                {c.isDemo && <DemoBadge />}
              </div>
              <h1 className="text-h1 mt-4 text-ink-950">{c.name}</h1>
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-ink-600">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-brand-700" aria-hidden /> {formatDateRange(c.startDate, c.endDate, locale)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-brand-700" aria-hidden /> {[c.venue, c.city, c.country].filter(Boolean).join(locale === "ar" ? "، " : ", ")}
                </span>
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-ink-100">
                <Photo src={c.imageUrl} alt="" priority sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              [t("comp.d.athletes"), c.athletes.length],
              [t("comp.d.events"), c.disciplines.length],
              [t("comp.d.results"), c.results.length],
              [t("comp.d.medals"), c.medals.gold + c.medals.silver + c.medals.bronze],
            ].map(([k, v]) => (
              <div key={k} className="card p-5">
                <dt className="text-sm font-medium text-ink-600">{k}</dt>
                <dd className="mt-1 text-3xl text-mark text-ink-950">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            {c.description && (
              <div>
                <p className="text-lg leading-relaxed text-ink-700">{c.description}</p>
                {c.sourceUrl && (
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                    <ExternalLink className="size-3.5" aria-hidden /> {t("comp.source")}
                  </a>
                )}
              </div>
            )}

            <section aria-labelledby="results-title">
              <h2 id="results-title" className="text-h2 mb-6">
                {t("comp.resultsByEvent")}
              </h2>
              {byDiscipline.length === 0 ? (
                <EmptyState
                  title={c.live === "upcoming" ? t("comp.empty.notStarted") : t("comp.empty.toPublish")}
                  body={c.live === "upcoming" ? t("comp.empty.notStartedBody") : t("comp.empty.toPublishBody")}
                />
              ) : (
                <div className="space-y-10">
                  {byDiscipline.map((g) => (
                    <div key={g.discipline.id}>
                      <h3 className="text-h3 mb-3 flex items-center gap-3">
                        <span className="h-4 w-0.5 bg-brand-600" aria-hidden />
                        {g.discipline.name}
                      </h3>
                      <ResultsTable rows={g.rows} hide={["competition", "discipline"]} caption={t("comp.eventResults", { name: g.discipline.name })} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {c.news.length > 0 && (
              <section aria-labelledby="news-title">
                <h2 id="news-title" className="text-h2 mb-6">
                  {t("comp.stories")}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {c.news.slice(0, 4).map((n) => (
                    <StoryCard key={n.id} s={n} />
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="gallery-title">
              <div className="mb-6 flex items-end justify-between">
                <h2 id="gallery-title" className="text-h2">
                  {t("comp.gallery")}
                </h2>
                <span className="text-sm text-ink-500">{t("comp.placeholderImagery")}</span>
              </div>
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {gallery.map((g, i) => (
                  <li key={i} className={`relative overflow-hidden rounded-md bg-ink-100 ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                    <Photo src={g} alt="" sizes="(min-width:768px) 25vw, 50vw" />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="card p-6 lg:sticky lg:top-28">
              <h2 className="text-eyebrow text-ink-500">{t("comp.medalTable")}</h2>
              <ul className="mt-5 grid grid-cols-3 gap-4 border-b border-line pb-6">
                {(["gold", "silver", "bronze"] as const).map((m) => (
                  <li key={m}>
                    <p className="text-4xl text-mark text-ink-950">{c.medals[m]}</p>
                    <MedalDot medal={m} className="mt-2 text-ink-600" />
                  </li>
                ))}
              </ul>
              {medalists.length > 0 ? (
                <ul className="mt-2 divide-y divide-line">
                  {medalists.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-[0.9375rem]">
                      <Link href={`/athletes/${r.athlete.slug}`} className="font-semibold text-ink-900 hover:text-brand-700">
                        {fullName(r.athlete)}
                      </Link>
                      <span className="flex items-center gap-2 text-ink-600">
                        {r.discipline.name}
                        <MedalDot medal={r.medal!} label={false} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-ink-600">{t("comp.noMedals")}</p>
              )}
            </div>

            {c.athletes.length > 0 && (
              <div className="card p-6">
                <h2 className="text-eyebrow mb-4 text-ink-500">{t("comp.team")}</h2>
                <ul className="flex flex-wrap gap-2">
                  {c.athletes.map((a) => (
                    <li key={a.id}>
                      <Link href={`/athletes/${a.slug}`} className="inline-flex h-11 items-center rounded-xs border border-line bg-white px-3 text-[0.9375rem] font-medium hover:border-ink-900 hover:text-brand-700">
                        {fullName(a)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c.events.length > 0 && (
              <div className="card p-6">
                <h2 className="text-eyebrow mb-2 text-ink-500">{t("comp.calendar")}</h2>
                <ul className="divide-y divide-line">
                  {c.events.map((e) => (
                    <li key={e.id}>
                      <Link href={`/events/${e.slug}`} className="block min-h-11 py-3 hover:text-brand-700">
                        <span className="block font-semibold">{e.title}</span>
                        <span className="text-[0.9375rem] text-ink-600">{formatDate(e.startAt, undefined, locale)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c.documents.length > 0 && (
              <div>
                <h2 className="text-eyebrow mb-4 text-ink-500">{t("comp.documents")}</h2>
                <ul className="space-y-4">
                  {c.documents.map((d) => (
                    <li key={d.id} className="card flex items-start gap-3 p-5">
                      <FileText className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                      <span>
                        <span className="block font-semibold">{d.title}</span>
                        <span className="text-sm text-ink-500">
                          {d.fileType} · {d.isDemo ? t("comp.demoDoc") : formatDate(d.publishedAt, undefined, locale)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
