import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/clean-athletics";
import { getTopics } from "@/lib/clean-athletics-i18n";
import { getT } from "@/lib/i18n/server";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/clean-athletics/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const { t: tr, locale } = await getT();
  const t = getTopics(locale).find((x) => x.slug === topic);
  if (!t) return {};
  return { title: `${t.title} · ${tr("clean.topic.metaSuffix")}`, description: t.lead, alternates: { canonical: `/clean-athletics/${t.slug}` } };
}

export default async function TopicPage({ params }: PageProps<"/clean-athletics/[topic]">) {
  const { topic } = await params;
  const { t: tr, locale } = await getT();
  const TOPICS_L = getTopics(locale);
  const t = TOPICS_L.find((x) => x.slug === topic);
  if (!t) notFound();

  return (
    <>
      <PageHero eyebrow={tr("clean.topic.eyebrow")} title={t.title} intro={t.lead} crumbs={[{ label: tr("clean.topic.crumb"), href: "/clean-athletics" }, { label: t.title }]} />
      <div className="container-x section-y grid gap-10 lg:grid-cols-12 lg:gap-14">
        <nav aria-label={tr("clean.topic.nav")} className="lg:col-span-3">
          <ul className="space-y-1 lg:sticky lg:top-28">
            {TOPICS_L.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/clean-athletics/${x.slug}`}
                  aria-current={x.slug === t.slug ? "page" : undefined}
                  className={cn(
                    "block min-h-11 border-s-2 py-2.5 ps-4 text-[0.9375rem] transition-colors",
                    x.slug === t.slug ? "border-brand-600 font-semibold text-ink-950" : "border-line text-ink-600 hover:border-ink-400 hover:text-ink-900",
                  )}
                >
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl lg:col-span-9">
          {t.sections.map((s) => (
            <section key={s.heading} className="border-t border-line py-8 first:border-t-0 first:pt-0">
              <h2 className="text-h3 text-ink-950">{s.heading}</h2>
              {s.body.length > 1 ? (
                <ul className="mt-4 space-y-3">
                  {s.body.map((b) => (
                    <li key={b} className="flex gap-3 text-lg text-ink-700">
                      <span className="mt-3 h-px w-4 shrink-0 bg-brand-600" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-lg text-ink-700">{s.body[0]}</p>
              )}
            </section>
          ))}
          {t.actions && (
            <div className="mt-6 card flex flex-wrap gap-3 bg-pearl p-6">
              {t.actions.map((a, i) => (
                <ButtonLink key={a.href + a.label} href={a.href} external variant={i === 0 ? "primary" : "secondary"}>
                  {a.label}
                </ButtonLink>
              ))}
            </div>
          )}
          <p className="mt-10 text-sm leading-relaxed text-ink-500">
            {tr("clean.topic.note")}{" "}
            <a href={t.legacy} className="underline underline-offset-2 hover:text-brand-700" target="_blank" rel="noopener noreferrer">
              {t.legacy.replace("https://www.", "")}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
