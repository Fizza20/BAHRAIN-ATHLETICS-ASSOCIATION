import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";
import { getAchievements, getStats } from "@/lib/queries";
import { PageHero, HeroStats } from "@/components/site/page-hero";
import { MedalDot, RecordTag } from "@/components/ui/badge";
import { formatDate, fullName } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("achievements.title"),
    description: t("achievements.metaDesc"),
    alternates: { canonical: "/achievements" },
  };
}

export default async function AchievementsPage() {
  const { t, locale } = await getT();
  const [items, stats] = await Promise.all([getAchievements(), getStats()]);
  const years = Array.from(new Set(items.map((i) => i.year))).sort((a, b) => b - a);

  return (
    <>
      <PageHero
        eyebrow={t("achievements.eyebrow")}
        title={t("achievements.title")}
        intro={t("achievements.intro")}
        crumbs={[{ label: t("achievements.crumb.federation"), href: "/about" }, { label: t("achievements.title") }]}
        aside={
          <HeroStats
            items={[
              { label: t("achievements.stat.medals"), value: stats.medals },
              { label: t("achievements.stat.records"), value: stats.records },
            ]}
          />
        }
      />
      <div className="container-x section-y">
        {years.map((y) => (
          <section key={y} aria-labelledby={`y-${y}`} className="grid gap-8 border-t border-line py-10 first:border-t-0 first:pt-0 lg:grid-cols-12">
            <h2 id={`y-${y}`} className="text-h1 tabular text-ink-950 lg:sticky lg:top-28 lg:col-span-3 lg:self-start">
              {y}
            </h2>
            <ol className="space-y-4 lg:col-span-9">
              {items
                .filter((i) => i.year === y)
                .map((a) => (
                  <li key={a.id} className="card grid gap-4 p-6 md:grid-cols-[160px_1fr]">
                      <div className="flex items-center gap-3 md:flex-col md:items-start">
                        <time className="text-sm font-semibold text-ink-600">{formatDate(a.date, { day: "numeric", month: "short" }, locale)}</time>
                        {a.type === "record" ? <RecordTag record="AR" /> : a.medal ? <MedalDot medal={a.medal} /> : <span className="text-eyebrow text-brand-700">{t(keyOf("achievements.type", a.type))}</span>}
                      </div>
                      <div>
                        <h3 className="text-h3 text-ink-950">{a.title}</h3>
                        {a.description && <p className="mt-3 text-ink-600">{a.description}</p>}
                        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.9375rem] font-semibold">
                          {a.athlete && (
                            <Link href={`/athletes/${a.athlete.slug}`} className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                              {locale === "ar" && a.athlete.nameAr ? a.athlete.nameAr : fullName(a.athlete)}
                              <ArrowRight className="size-4" aria-hidden />
                            </Link>
                          )}
                          {a.competition && (
                            <Link href={`/competitions/${a.competition.slug}`} className="text-ink-600 hover:text-ink-950 hover:underline">
                              {a.competition.name}
                            </Link>
                          )}
                          {a.sourceUrl && (
                            <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-normal text-ink-600 hover:text-ink-950">
                              <ExternalLink className="size-4" aria-hidden /> {t("achievements.source")}
                            </a>
                          )}
                        </p>
                      </div>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
