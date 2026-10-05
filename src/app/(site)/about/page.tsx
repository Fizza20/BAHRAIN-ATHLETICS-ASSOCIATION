import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { organisation } from "@/db/seed-data/real";
import { getBoard, getStats } from "@/lib/queries";
import { PageHero } from "@/components/site/page-hero";
import { getT } from "@/lib/i18n/server";
import { Photo } from "@/components/ui/photo";
import { photos } from "@/lib/images";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("about.meta.title"), description: t("about.about"), alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const { t, locale } = await getT();
  const ar = locale === "ar";
  const [board, stats] = await Promise.all([getBoard(), getStats()]);
  const aboutText = ar ? t("about.about") : organisation.about;
  const mission = ar ? t("about.mission") : organisation.mission;
  const standards = ar ? t("about.standards") : organisation.standards;
  const vision = ar ? t("about.vision") : organisation.vision;
  const president = board.find((b) => b.title === "President");

  const pillars = [
    [t("about.pillar.organise"), t("about.pillar.organise.d")],
    [t("about.pillar.develop"), t("about.pillar.develop.d")],
    [t("about.pillar.represent"), t("about.pillar.represent.d")],
    [t("about.pillar.protect"), t("about.pillar.protect.d")],
  ];

  return (
    <>
      <PageHero
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        intro={aboutText}
        crumbs={[{ label: t("about.crumb.federation"), href: "/about" }, { label: t("about.crumb.about") }]}
        image={photos.stadiumView.src}
      />

      <section className="section-y bg-bone">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow mb-3 text-brand-700">{t("about.missionEyebrow")}</p>
            <h2 className="text-h2 text-ink-950">{t("about.missionHeading")}</h2>
          </div>
          <div className="space-y-5 text-lg text-ink-600 lg:col-span-7">
            <p className="text-xl font-semibold leading-snug text-ink-900">{mission}</p>
            <p>{standards}</p>
            <p className="text-sm text-ink-500">
              {t("about.source")}{" "}
              <a href={organisation.source} className="underline underline-offset-2 hover:text-brand-700" target="_blank" rel="noopener noreferrer">
                baa.bh/about
              </a>
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="role-title" className="section-y bg-pearl">
        <div className="container-x">
          <p className="text-eyebrow mb-3 text-brand-700">{t("about.roleEyebrow")}</p>
          <h2 id="role-title" className="text-h2 max-w-3xl text-ink-950">
            {t("about.roleHeading")}
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map(([t, d], i) => (
              <li key={t} className="card flex h-full flex-col p-6">
                <span className="text-h2 tabular text-brand-700">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-h3 mt-4 text-ink-950">{t}</h3>
                <p className="mt-2 text-ink-600">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-ink-500">{t("about.roleNote")}</p>
        </div>
      </section>

      <section className="grid bg-bone lg:grid-cols-2">
        <div className="container-x section-y flex flex-col justify-center lg:max-w-none lg:px-16 xl:px-24">
          <p className="text-eyebrow mb-3 text-brand-700">{t("about.visionEyebrow")}</p>
          <blockquote className="text-h1 text-ink-950">“{vision}”</blockquote>
          {president && (
            <p className="mt-6 text-ink-600">
              <strong className="text-ink-950">{president.name}</strong>, {t("about.president")}
            </p>
          )}
        </div>
        <div className="relative min-h-[320px] bg-ink-100">
          <Photo src={photos.sunrise.src} alt={photos.sunrise.alt} sizes="50vw" />
        </div>
      </section>

      <section className="section-y bg-pearl">
        <div className="container-x">
          <h2 className="text-h2 max-w-2xl text-ink-950">{t("about.explore")}</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [t("about.card.board"), "/about/board", t("about.card.board.d", { n: board.length })],
              [t("about.card.governance"), "/about/governance", t("about.card.governance.d")],
              [t("about.card.documents"), "/about/documents", t("about.card.documents.d")],
              [t("about.card.achievements"), "/achievements", t("about.card.achievements.d", { medals: stats.medals, records: stats.records, label: t(stats.records === 1 ? "about.records.one" : "about.records.other") })],
            ].map(([t, h, d]) => (
              <li key={h} className="card card-interactive relative flex h-full flex-col p-6">
                <span className="text-h3 flex items-center justify-between text-ink-950">
                  <Link href={h} className="after:absolute after:inset-0 after:content-['']">
                    {t}
                  </Link>
                  <ArrowUpRight className="size-5 text-ink-500" aria-hidden />
                </span>
                <span className="mt-2 text-[0.9375rem] text-ink-600">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
