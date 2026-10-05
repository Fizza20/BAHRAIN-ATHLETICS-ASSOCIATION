import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Pill, FileCheck2, Megaphone } from "lucide-react";
import { getTopics, getPartners } from "@/lib/clean-athletics-i18n";
import { getT } from "@/lib/i18n/server";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { cleanAthleticsLinks } from "@/db/seed-data/real";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("clean.meta.title"), description: t("clean.meta.desc"), alternates: { canonical: "/clean-athletics" } };
}

export default async function CleanAthleticsPage() {
  const { t, locale } = await getT();
  const TOPICS = getTopics(locale);
  const PARTNERS = getPartners(locale);
  const quick = [
    { icon: Pill, title: t("clean.quick.med.title"), body: t("clean.quick.med.body"), href: "/clean-athletics/check-your-medication" },
    { icon: FileCheck2, title: t("clean.quick.tue.title"), body: t("clean.quick.tue.body"), href: "/clean-athletics/therapeutic-use-exemptions" },
    { icon: Megaphone, title: t("clean.quick.report.title"), body: t("clean.quick.report.body"), href: "/clean-athletics/report-doping" },
  ];
  return (
    <>
      <PageHero
        eyebrow={t("clean.eyebrow")}
        title={t("clean.title")}
        intro={t("clean.intro")}
        crumbs={[{ label: t("clean.title") }]}
        aside={
          <div className="card flex items-start gap-4 p-6">
            <ShieldCheck className="size-8 shrink-0 text-success" aria-hidden />
            <p className="text-[0.9375rem] text-ink-700">
              {t("clean.quote")}
            </p>
          </div>
        }
      />

      <section className="container-x section-y">
        <h2 className="sr-only">{t("clean.quickHelp")}</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {quick.map((q) => (
            <li key={q.href} className="card card-interactive relative flex h-full items-start gap-5 p-6">
              <q.icon className="size-7 shrink-0 text-brand-600" aria-hidden />
              <span className="flex-1">
                <Link href={q.href} className="text-h3 block text-ink-950 after:absolute after:inset-0 after:content-['']">
                  {q.title}
                </Link>
                <span className="mt-1 block text-[0.9375rem] text-ink-600">{q.body}</span>
              </span>
              <ArrowUpRight className="size-5 text-ink-500" aria-hidden />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="topics-title" className="section-y bg-pearl">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="topics-title" className="text-h2 text-ink-950">
              {t("clean.guidance")}
            </h2>
            <p className="mt-4 text-ink-600">{t("clean.guidanceIntro")}</p>
          </div>
          <ol className="space-y-4 lg:col-span-8">
            {TOPICS.map((t, i) => (
              <li key={t.slug} className="card card-interactive relative grid grid-cols-[40px_1fr_auto] items-center gap-4 p-5">
                <span className="text-h3 tabular text-brand-700">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <Link href={`/clean-athletics/${t.slug}`} className="text-h3 block text-ink-950 after:absolute after:inset-0 after:content-['']">
                    {t.title}
                  </Link>
                  <span className="mt-1 block text-[0.9375rem] text-ink-600">{t.short}</span>
                </span>
                <ArrowUpRight className="size-5 text-ink-500" aria-hidden />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="partners-title" className="container-x section-y">
        <h2 id="partners-title" className="text-h2 text-ink-950">
          {t("clean.partners")}
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {PARTNERS.map((p) => (
            <li key={p.name} className="card card-interactive relative">
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col p-6 after:absolute after:inset-0 after:content-['']">
                <span className="text-h1 text-ink-950">{p.name}</span>
                <span className="mt-2 text-ink-600">{p.full}</span>
                <span className="mt-5 inline-flex items-center gap-1 font-semibold text-brand-700 group-hover:underline">
                  {t("clean.visit")} <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={cleanAthleticsLinks.bnado} external>
            {t("clean.reportBnado")}
          </ButtonLink>
          <ButtonLink href={cleanAthleticsLinks.aiu} external variant="secondary">
            {t("clean.reportAiu")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
