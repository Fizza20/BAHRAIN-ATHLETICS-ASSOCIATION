import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { getAthleteBySlug, getRelatedAthletes } from "@/lib/queries";
import { photoForGroup } from "@/lib/images";
import { formatDate, formatDateRange, fullName, SITE_URL } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";
import { effectiveStatus } from "@/lib/status";
import { Breadcrumbs, EmptyState } from "@/components/site/page-hero";
import { Photo } from "@/components/ui/photo";
import { DemoBadge, MedalDot, RecordTag, StatusBadge } from "@/components/ui/badge";
import { ResultsTable } from "@/components/domain/results-table";
import { StoryCard } from "@/components/domain/news-story";
import { AthleteCard } from "@/components/domain/athlete-card";

export async function generateMetadata({ params }: PageProps<"/athletes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAthleteBySlug(slug);
  const { t, locale } = await getT();
  if (!a) return { title: t("athlete.notFound") };
  const name = locale === "ar" && a.nameAr ? a.nameAr : fullName(a);
  return {
    title: `${name} · ${a.primaryDiscipline?.name ?? t("athlete.metaTitleFallback")}`,
    description: a.headline ? t("athlete.metaDescHeadline", { name, headline: a.headline }) : t("athlete.metaDesc", { name }),
    alternates: { canonical: `/athletes/${a.slug}` },
    openGraph: { type: "profile", title: name, description: a.headline ?? undefined },
    robots: a.isDemo ? { index: false } : undefined,
  };
}

export default async function AthletePage({ params }: PageProps<"/athletes/[slug]">) {
  const { slug } = await params;
  const a = await getAthleteBySlug(slug);
  if (!a) notFound();
  const { t, locale } = await getT();
  const related = await getRelatedAthletes(a.id, a.primaryDiscipline?.group);
  const enName = fullName(a);
  const name = locale === "ar" && a.nameAr ? a.nameAr : enName;
  const photo = a.imageUrl ? { src: a.imageUrl } : photoForGroup(a.primaryDiscipline?.group);
  const totalMedals = a.medals.gold + a.medals.silver + a.medals.bronze;
  const wins = a.results.filter((r) => r.position === 1).length;

  const resultRows = a.results.map((r) => ({
    result: r,
    athlete: a,
    discipline: r.discipline,
    competition: r.competition,
  }));

  const sections = [
    { id: "bests", label: t("athlete.sec.bests"), show: a.bests.length > 0 },
    { id: "results", label: t("athlete.sec.results"), show: true },
    { id: "competitions", label: t("athlete.sec.competitions"), show: a.competitions.length > 0 },
    { id: "achievements", label: t("athlete.sec.achievements"), show: a.achievements.length > 0 },
    { id: "news", label: t("athlete.sec.news"), show: a.newsItems.length > 0 },
  ].filter((s) => s.show);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: enName,
    url: `${SITE_URL}/athletes/${a.slug}`,
    nationality: { "@type": "Country", name: "Bahrain" },
    jobTitle: "Athlete",
    description: a.headline,
    memberOf: { "@type": "SportsOrganization", name: "Bahrain Athletics Association" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Profile header */}
      <section className="border-b border-line bg-pearl">
        <div className="container-x py-8 md:py-12">
          <Breadcrumbs items={[{ label: t("athletes.title"), href: "/athletes" }, { label: name }]} />
          <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-eyebrow flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-500">
                <span className="text-brand-700">{a.primaryDiscipline?.name}</span>
                <span aria-hidden>/</span>
                {t(keyOf("category", a.category))} {t(keyOf("gender", a.gender))}
                <span aria-hidden>/</span>
                <span className="inline-flex items-center gap-2">
                  <FlagMark /> {t("athlete.country")}
                </span>
                {a.isDemo && <DemoBadge />}
              </p>
              <h1 className="text-h1 mt-4 text-ink-950">{name}</h1>
              {a.headline && <p className="mt-4 max-w-xl text-lg text-ink-600">{a.headline}</p>}

              <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4">
                {[
                  [t("athlete.stat.results"), a.results.length],
                  [t("athlete.stat.wins"), wins],
                  [t("athlete.stat.medals"), totalMedals],
                ].map(([k, v]) => (
                  <div key={k} className="card p-5">
                    <dt className="text-sm font-medium text-ink-600">{k}</dt>
                    <dd className="mt-1 text-3xl text-mark text-ink-950">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-md bg-ink-100 lg:max-w-none">
                <Photo src={photo.src} alt={a.imageUrl ? name : ""} priority sizes="(min-width: 1024px) 40vw, 100vw" className={a.imageUrl ? "" : "opacity-60 grayscale"} fallbackLabel={a.lastName} />
              </div>
              {!a.imageUrl && <p className="mt-2 text-sm text-ink-500">{t("athlete.portraitPending")}</p>}
              <dl className="card mt-4 grid grid-cols-2 gap-4 p-5 text-sm">
                {[
                  [t("athlete.info.event"), a.primaryDiscipline?.name ?? "—"],
                  [t("athlete.info.category"), t(keyOf("category", a.category))],
                  [t("athlete.info.club"), a.club ?? "—"],
                  [t("athlete.info.status"), a.status === "active" ? t("athlete.status.active") : t("athlete.status.retired")],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-eyebrow text-ink-500">{k}</dt>
                    <dd className="mt-1.5 truncate font-semibold text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* In-page navigation */}
      <nav aria-label={t("athlete.sectionsNav")} className="sticky top-[72px] z-20 border-b border-line bg-bone/95 backdrop-blur-md">
        <div className="container-x scrollbar-none flex gap-1 overflow-x-auto">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="flex h-12 shrink-0 items-center px-4 text-[0.9375rem] font-semibold text-ink-600 hover:text-brand-700">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            {/* Bio */}
            {a.bio && (
              <div>
                <p className="text-lg leading-relaxed text-ink-700">{a.bio}</p>
                {a.sourceUrl && (
                  <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                    <ExternalLink className="size-3.5" aria-hidden /> {t("athlete.sourceBaa")}
                  </a>
                )}
              </div>
            )}

            {/* Bests */}
            {a.bests.length > 0 && (
              <section id="bests" aria-labelledby="bests-title" className="scroll-mt-32">
                <h2 id="bests-title" className="text-h2 mb-6">
                  {t("athlete.bests.title")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {a.bests.map((b, i) => (
                    <div key={b.discipline.id} className={`card p-6 ${i === a.bests.length - 1 && a.bests.length % 2 === 1 ? "sm:col-span-2" : ""}`}>
                      <p className="text-eyebrow text-ink-500">{b.discipline.name}</p>
                      <div className="mt-4 grid grid-cols-2 gap-6">
                        <div className="border-s-2 border-brand-600 ps-4">
                          <p className="text-sm font-semibold text-ink-600">{t("athlete.bests.pb")}</p>
                          <p className="mt-1 flex items-center gap-2 text-3xl text-mark">
                            {b.pb?.mark ?? "—"}
                            {b.pb?.record && <RecordTag record={b.pb.record} />}
                          </p>
                          {b.pb && <p className="mt-1 text-sm text-ink-500">{formatDate(b.pb.date, { month: "short", year: "numeric" }, locale)}</p>}
                        </div>
                        <div className="border-s-2 border-line ps-4">
                          <p className="text-sm font-semibold text-ink-600">{t("athlete.bests.sb", { year: new Date().getFullYear() })}</p>
                          <p className="mt-1 text-3xl text-mark text-ink-700">{b.sb?.mark ?? "—"}</p>
                          {b.sb?.competition && <p className="mt-1 truncate text-sm text-ink-500">{b.sb.competition}</p>}
                        </div>
                      </div>
                      {!b.pb && <p className="mt-4 text-sm text-ink-500">{t("athlete.bests.none")}</p>}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink-500">{t("athlete.bests.note")}</p>
              </section>
            )}

            {/* Results */}
            <section id="results" aria-labelledby="results-title" className="scroll-mt-32">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h2 id="results-title" className="text-h2">
                  {t("athlete.results.title")}
                </h2>
                <Link href={`/results?athlete=${a.slug}`} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                  {t("athlete.results.link")}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              {resultRows.length ? <ResultsTable rows={resultRows} hide={["athlete"]} caption={t("athlete.results.caption", { name })} /> : <EmptyState title={t("athlete.results.empty")} />}
            </section>

            {/* Competitions */}
            {a.competitions.length > 0 && (
              <section id="competitions" aria-labelledby="comp-title" className="scroll-mt-32">
                <h2 id="comp-title" className="text-h2 mb-6">
                  {t("athlete.competitions.title")}
                </h2>
                <ul className="grid gap-4">
                  {a.competitions.map((c) => (
                    <li key={c.id} className="card card-interactive relative flex items-center justify-between gap-4 p-5">
                      <div>
                        <Link href={`/competitions/${c.slug}`} className="block font-semibold text-ink-900 after:absolute after:inset-0 after:content-[''] hover:text-brand-700">
                          {c.name}
                        </Link>
                        <span className="text-[0.9375rem] text-ink-600">
                          {c.city}, {c.country} · {formatDateRange(c.startDate, c.endDate, locale)}
                        </span>
                      </div>
                      <span className="flex items-center gap-3">
                        <span className="text-eyebrow hidden text-ink-500 sm:inline">{t(keyOf("level", c.level))}</span>
                        <StatusBadge status={effectiveStatus(c.status, c.startDate, c.endDate)} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Achievements */}
            {a.achievements.length > 0 && (
              <section id="achievements" aria-labelledby="ach-title" className="scroll-mt-32">
                <h2 id="ach-title" className="text-h2 mb-6">
                  {t("athlete.achievements.title")}
                </h2>
                <ol className="relative space-y-8 border-s-2 border-line ps-8">
                  {a.achievements.map((x) => (
                    <li key={x.id} className="relative">
                      <span className="absolute -start-[41px] top-1 size-4 rounded-full border-4 border-bone bg-brand-600" aria-hidden />
                      <p className="text-eyebrow text-ink-500">{x.year}</p>
                      <h3 className="text-h3 mt-2 flex flex-wrap items-center gap-3">
                        {x.title}
                        {x.medal && <MedalDot medal={x.medal} />}
                      </h3>
                      {x.description && <p className="mt-2 text-ink-600">{x.description}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* News */}
            {a.newsItems.length > 0 && (
              <section id="news" aria-labelledby="news-title" className="scroll-mt-32">
                <h2 id="news-title" className="text-h2 mb-6">
                  {t("athlete.news.title")}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {a.newsItems.slice(0, 4).map((n) => (
                    <StoryCard key={n.id} s={n} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="card p-6">
                <h2 className="text-eyebrow text-ink-500">{t("athlete.medalRecord")}</h2>
                <ul className="mt-5 grid grid-cols-3 gap-4">
                  {(["gold", "silver", "bronze"] as const).map((m) => (
                    <li key={m}>
                      <p className="text-4xl text-mark text-ink-950">{a.medals[m]}</p>
                      <MedalDot medal={m} className="mt-2 text-ink-600" />
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-ink-500">{t("athlete.medalNote")}</p>
              </div>

              <div className="card p-6">
                <h2 className="text-eyebrow text-ink-500">{t("athlete.representing")}</h2>
                <p className="mt-3 flex items-center gap-3 text-lg font-bold">
                  <FlagMark className="h-5 w-8" /> {t("athlete.country")}
                </p>
                <p className="mt-2 text-[0.9375rem] text-ink-600">{t("athlete.representingNote")}</p>
              </div>

              {related.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-eyebrow mb-2 text-ink-500">{t("athlete.related")}</h2>
                  <ul className="divide-y divide-line">
                    {related.map((r) => (
                      <li key={r.athlete.id}>
                        <Link href={`/athletes/${r.athlete.slug}`} className="group flex min-h-11 items-center justify-between py-3">
                          <span>
                            <span className="block font-semibold group-hover:text-brand-700">{locale === "ar" && r.athlete.nameAr ? r.athlete.nameAr : fullName(r.athlete)}</span>
                            <span className="text-[0.9375rem] text-ink-600">{r.discipline?.name}</span>
                          </span>
                          <ArrowUpRight className="size-4 text-ink-500 group-hover:text-brand-600" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="more-title" className="section-y border-t border-line bg-pearl">
          <div className="container-x">
            <h2 id="more-title" className="text-h2 mb-8">
              {t("athlete.more")}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <li key={r.athlete.id}>
                  <AthleteCard a={r.athlete} discipline={r.discipline} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

/** Simplified Bahrain flag: white hoist, red fly, five-point serration. */
function FlagMark({ className = "h-3 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 30" className={className} aria-hidden>
      <rect width="50" height="30" fill="#CE1126" />
      <path d="M0 0h12l6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3 6 3-6 3H0z" fill="#fff" />
    </svg>
  );
}
