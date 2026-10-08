import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { getHomeData } from "@/lib/queries";
import { organisation, cleanAthleticsLinks } from "@/db/seed-data/real";
import { photos } from "@/lib/images";
import { formatDate, fullName } from "@/lib/utils";
import { BigMarquee, Hero, ResultsTicker } from "@/components/home/hero";
import { SeasonNumbers, type SeasonFigure } from "@/components/home/season-numbers";
import { AthleteSpotlight, type SpotlightAthlete } from "@/components/home/athlete-spotlight";
import { ResultsTable } from "@/components/domain/results-table";
import { EventRow } from "@/components/domain/event-row";
import { LeadStory, SideStory } from "@/components/domain/news-story";
import { SectionHeader } from "@/components/ui/motifs";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { MedalDot, RecordTag } from "@/components/ui/badge";
import { SocialLinks } from "@/components/site/social";
import { ClipReveal, ScrubText } from "@/components/ui/motion";
import { HorizontalShowcase } from "@/components/ui/horizontal-showcase";
import { getT } from "@/lib/i18n/server";

export const revalidate = 300;

export default async function HomePage() {
  const { t, locale } = await getT();
  const { featured, latestResults, news, events, achievements } = await getHomeData();

  // Hero: the record-setting result is the season's defining mark.
  const recordRow = latestResults.find((r) => r.result.record) ?? latestResults[0];
  const toRail = (r: (typeof latestResults)[number]) => ({
    id: r.result.id,
    athlete: r.athlete,
    discipline: r.discipline.name,
    mark: r.result.mark,
    position: r.result.position,
    competition: r.competition?.name,
    record: r.result.record,
    date: r.result.date,
  });

  const real = latestResults.filter((r) => !r.result.isDemo);
  const rail = real.slice(0, 8).map(toRail);

  const figures: SeasonFigure[] = [
    { value: "12:45.70", kind: "mark", label: "home.fig.ar5000", detail: "home.fig.ar5000.detail", href: "/athletes/birhanu-balew" },
    { value: "49.57", kind: "mark", label: "home.fig.sb400", detail: "home.fig.sb400.detail", href: "/athletes/salwa-eid-naser" },
    { value: 10, kind: "count", label: "home.fig.medals", detail: "home.fig.medals.detail", href: "/results?medal=any&year=2026" },
    { value: 2, kind: "count", label: "home.fig.dl", detail: "home.fig.dl.detail", href: "/competitions/lausanne-diamond-league-2026" },
  ];

  const spotlight: SpotlightAthlete[] = featured.map((a) => {
    const r = a.results[0];
    return {
      slug: a.slug,
      firstName: a.firstName,
      lastName: a.lastName,
      category: a.category,
      gender: a.gender,
      headline: a.headline,
      imageUrl: a.imageUrl,
      discipline: a.primaryDiscipline ? { name: a.primaryDiscipline.name, group: a.primaryDiscipline.group } : null,
      latest: r
        ? { mark: r.mark, position: r.position, competition: r.competition?.shortName ?? r.competition?.name ?? null, date: r.date, record: r.record, discipline: r.discipline.name }
        : null,
    };
  });

  const upcoming = events.filter((e) => e.live === "upcoming" || e.live === "ongoing").slice(0, 4);
  const recent = events
    .filter((e) => e.live === "completed" && !e.isDemo && e.type !== "training-camp")
    .sort((a, b) => (b.startAt ?? "").localeCompare(a.startAt ?? ""))
    .slice(0, 4);
  const postponed = events.find((e) => e.live === "postponed");

  const [lead, ...rest] = news;

  return (
    <>
      <Hero headline={toRail(recordRow)} />
      <ResultsTicker items={rail} />

      {/* Statement: words light up as you scroll */}
      <section aria-label={t("home.statement.cta")} className="bg-white py-20 md:py-32">
        <div className="container-x">
          <p className="text-eyebrow mb-6 flex items-center gap-3 text-brand-700">
            <span className="h-px w-10 bg-brand-600" aria-hidden />
            {t("home.about.eyebrow")}
          </p>
          <ScrubText
            text={t("home.statement")}
            className="max-w-5xl text-[clamp(1.875rem,4.6vw,4rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-950 rtl:leading-[1.5] rtl:tracking-normal"
          />
          <div className="mt-10">
            <ButtonLink href="/about" variant="secondary" className="rounded-full">
              {t("home.statement.cta")}
            </ButtonLink>
          </div>
        </div>
      </section>

      <BigMarquee words={[t("nav.athletes"), t("nav.results"), t("nav.events"), t("nav.news")]} />

      <SeasonNumbers figures={figures} />

      {/* Athletes */}
      <section aria-labelledby="athletes-title" className="section-y grain relative isolate overflow-hidden bg-ink-950 text-white">
        <div className="animate-drift-a absolute -top-40 start-1/4 -z-10 size-[560px] rounded-full bg-brand-600/30 blur-[120px]" aria-hidden />
        <div className="animate-drift-b absolute -bottom-52 end-0 -z-10 size-[520px] rounded-full bg-brand-500/20 blur-[130px]" aria-hidden />
        <div className="container-x relative">
          <SectionHeader
            inverse
            eyebrow={t("home.athletes.eyebrow")}
            title={<span id="athletes-title">{t("home.athletes.title")}</span>}
            intro={t("home.athletes.intro")}
            action={<ButtonLink href="/athletes" variant="outline-inverse">{t("home.athletes.all")}</ButtonLink>}
          />
          <div className="mt-12">
            <AthleteSpotlight athletes={spotlight} />
          </div>
        </div>
      </section>

      {/* Events */}
      <section aria-labelledby="calendar-title" className="section-y bg-bone">
        <div className="container-x">
          <SectionHeader
            eyebrow={t("home.events.eyebrow")}
            title={<span id="calendar-title">{t("home.events.title")}</span>}
            action={
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/competitions" variant="ghost">{t("home.events.competitions")}</ButtonLink>
                <ButtonLink href="/events" variant="secondary">{t("home.events.calendar")}</ButtonLink>
              </div>
            }
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h3 className="text-h3 mb-4">{t("home.events.upcoming")}</h3>
              <div className="space-y-3">
                {upcoming.map((e) => (
                  <EventRow key={e.slug} e={e} />
                ))}
              </div>
              {postponed && (
                <p className="mt-6 flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-4 text-[0.9375rem] text-ink-800">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-warning" aria-hidden />
                  <span>
                    <strong>{postponed.title}</strong> ({postponed.location}): {postponed.description}
                  </span>
                </p>
              )}
            </div>
            <aside className="lg:col-span-4" aria-labelledby="recent-title">
              <h3 id="recent-title" className="text-h3 mb-4">
                {t("home.events.recent")}
              </h3>
              <ul className="space-y-3">
                {recent.map((e) => (
                  <li key={e.slug} className="card card-interactive group relative p-4">
                    <Link href={`/competitions/${e.competition?.slug ?? ""}`} className="flex items-center justify-between gap-4 after:absolute after:inset-0 after:content-['']">
                      <span>
                        <span className="block font-semibold leading-snug text-ink-950 group-hover:text-brand-700">{e.title}</span>
                        <span className="mt-1 block text-[0.9375rem] text-ink-600">
                          {e.location} · {formatDate(e.startAt, { month: "short", year: "numeric" }, locale)}
                        </span>
                      </span>
                      <ArrowRight className="size-5 shrink-0 text-ink-400 group-hover:text-brand-600" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Results */}
      <section aria-labelledby="results-title" className="section-y bg-pearl">
        <div className="container-x">
          <SectionHeader
            eyebrow={t("home.results.eyebrow")}
            title={<span id="results-title">{t("home.results.title")}</span>}
            intro={t("home.results.intro")}
            action={<ButtonLink href="/results">{t("home.results.all")}</ButtonLink>}
          />
          <div className="mt-8">
            <ResultsTable rows={latestResults.filter((r) => !r.result.isDemo).slice(0, 6)} caption="Latest results" />
          </div>
        </div>
      </section>

      {/* Achievements */}
      <HorizontalShowcase
        className="section-y bg-bone"
        header={
          <SectionHeader
            eyebrow={t("home.ach.eyebrow")}
            title={<span id="story-title">{t("home.ach.title")}</span>}
            action={<ButtonLink href="/achievements" variant="secondary">{t("home.ach.all")}</ButtonLink>}
          />
        }
      >
            {achievements.slice(0, 6).map((a) => (
              <div key={a.id} className="card card-interactive relative flex flex-col p-6 lg:w-[400px] lg:shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <time className="text-sm font-medium text-ink-600" dateTime={a.date ?? undefined}>
                    {formatDate(a.date, { month: "long", year: "numeric" }, locale)}
                  </time>
                  {a.type === "record" ? <RecordTag record="AR" /> : a.medal ? <MedalDot medal={a.medal} /> : <span className="text-sm font-semibold capitalize text-brand-700">{a.type}</span>}
                </div>
                <h3 className="mt-3 text-h3">
                  {a.athlete ? (
                    <Link href={`/athletes/${a.athlete.slug}`} className="after:absolute after:inset-0 after:content-['']">
                      {a.title}
                    </Link>
                  ) : (
                    a.title
                  )}
                </h3>
                <p className="mt-2 text-ink-600">{a.description}</p>
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-[0.9375rem] font-semibold">
                  {a.athlete && <span className="text-brand-700">{fullName(a.athlete)}</span>}
                  {a.competition && (
                    <Link href={`/competitions/${a.competition.slug}`} className="relative z-10 font-medium text-ink-600 underline-offset-4 hover:text-brand-700 hover:underline">
                      {a.competition.shortName ?? a.competition.name}
                    </Link>
                  )}
                </div>
              </div>
            ))}
      </HorizontalShowcase>

      {/* News */}
      <section aria-labelledby="news-title" className="section-y bg-pearl">
        <div className="container-x">
          <SectionHeader eyebrow={t("home.news.eyebrow")} title={<span id="news-title">{t("home.news.title")}</span>} action={<ButtonLink href="/news" variant="secondary">{t("home.news.all")}</ButtonLink>} />
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">{lead && <LeadStory s={lead} />}</div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              {rest.slice(0, 4).map((s) => (
                <SideStory key={s.slug} s={s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section aria-labelledby="about-title" className="section-y bg-bone">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ClipReveal className="relative aspect-[4/3] overflow-hidden rounded-md bg-pearl">
            <Photo src={photos.stadium.src} alt={photos.stadium.alt} sizes="(min-width: 1024px) 50vw, 100vw" />
            <div className="absolute bottom-0 start-0 bg-brand-600 p-4 text-white md:p-5">
              <p className="font-arabic text-xl font-bold leading-tight md:text-2xl" lang="ar" dir="rtl">
                الاتحاد البحريني
                <br />
                لألعاب القوى
              </p>
            </div>
          </ClipReveal>
          <div>
            <p className="text-eyebrow mb-3 text-brand-700">{t("home.about.eyebrow")}</p>
            <h2 id="about-title" className="text-h2">
              {t("home.about.title")}
            </h2>
            <p className="mt-4 text-lg text-ink-700">{locale === "ar" ? t("home.about.text") : organisation.about}</p>
            <p className="mt-3 text-ink-600">{locale === "ar" ? t("home.about.mission") : organisation.mission}</p>
            <figure className="mt-6 border-s-4 border-brand-600 ps-5">
              <blockquote className="text-lg font-semibold leading-snug text-ink-950">“{locale === "ar" ? t("home.about.vision") : organisation.vision}”</blockquote>
              <figcaption className="mt-2 text-[0.9375rem] text-ink-600">{locale === "ar" ? t("home.about.visionBy") : organisation.visionBy}</figcaption>
            </figure>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/about">{t("home.about.about")}</ButtonLink>
              <ButtonLink href="/about/board" variant="secondary">
                {t("home.about.board")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Clean athletics */}
      <section aria-labelledby="integrity-title" className="section-y bg-pearl">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow mb-3 text-brand-700">{t("home.clean.eyebrow")}</p>
            <h2 id="integrity-title" className="text-h2">
              {t("home.clean.title")}
            </h2>
            <p className="mt-4 text-lg text-ink-600">{t("home.clean.text")}</p>
            <div className="card mt-6 flex items-start gap-4 p-5">
              <ShieldCheck className="size-7 shrink-0 text-success" aria-hidden />
              <p className="text-[0.9375rem] text-ink-700">
                {t("home.clean.report")}{" "}
                <a href={cleanAthleticsLinks.bnado} className="font-semibold text-brand-700 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  B-NADO
                </a>{" "}
                {t("home.clean.or")}{" "}
                <a href={cleanAthleticsLinks.aiu} className="font-semibold text-brand-700 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                  AIU
                </a>
                .
              </p>
            </div>
            <div className="mt-6">
              <ButtonLink href="/clean-athletics" variant="secondary">
                {t("home.clean.hub")}
              </ButtonLink>
            </div>
          </div>
          <ul className="grid gap-4 self-start sm:grid-cols-2 lg:col-span-7">
            {[
              [t("home.clean.rules"), "/clean-athletics/anti-doping-rules", t("home.clean.rules.d")],
              [t("home.clean.med"), "/clean-athletics/check-your-medication", t("home.clean.med.d")],
              [t("home.clean.tue"), "/clean-athletics/therapeutic-use-exemptions", t("home.clean.tue.d")],
              [t("home.clean.sup"), "/clean-athletics/supplements-policy", t("home.clean.sup.d")],
              [t("home.clean.wb"), "/clean-athletics/whistleblowing", t("home.clean.wb.d")],
              [t("home.clean.inel"), "/clean-athletics/ineligible", t("home.clean.inel.d")],
            ].map(([label, href, desc]) => (
              <li key={href} className="card card-interactive group relative p-5">
                <Link href={href} className="flex items-start gap-3 after:absolute after:inset-0 after:content-['']">
                  <span className="flex-1">
                    <span className="block font-bold leading-tight text-ink-950 group-hover:text-brand-700">{label}</span>
                    <span className="mt-1 block text-[0.9375rem] text-ink-600">{desc}</span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-ink-400 group-hover:text-brand-600" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final call to action */}
      <section aria-labelledby="cta-title" className="bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 text-white section-y">
        <div className="container-x text-center">
          <p className="text-eyebrow text-white/85">{t("home.cta.eyebrow")}</p>
          <h2 id="cta-title" className="text-h1 mx-auto mt-3 max-w-3xl">
            {t("home.cta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">{t("home.cta.text")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/events" variant="inverse" size="lg">
              {t("home.cta.calendar")}
            </ButtonLink>
            <ButtonLink href="/news" variant="outline-inverse" size="lg">
              {t("home.cta.news")}
            </ButtonLink>
          </div>
          <SocialLinks tone="inverse" className="mt-8 justify-center" />
        </div>
      </section>
    </>
  );
}
