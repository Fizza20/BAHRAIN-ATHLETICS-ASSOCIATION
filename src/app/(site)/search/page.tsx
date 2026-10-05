import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { globalSearch } from "@/lib/queries";
import { PageHero } from "@/components/site/page-hero";
import { formatDate, formatDateRange, fullName } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { DemoBadge } from "@/components/ui/badge";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("searchpage.meta.title"), robots: { index: false } };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const r = await globalSearch(q);
  const total = r.athletes.length + r.news.length + r.competitions.length + r.events.length;

  return (
    <>
      <PageHero eyebrow={t("searchpage.eyebrow")} title={q ? `“${q}”` : t("searchpage.title")} crumbs={[{ label: t("searchpage.title") }]}>
        <form action="/search" role="search" className="mt-8 flex max-w-2xl gap-2">
          <label className="relative flex-1">
            <span className="sr-only">{t("searchpage.label")}</span>
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-500" aria-hidden />
            <input name="q" defaultValue={q} type="search" placeholder={t("searchpage.placeholder")} className="h-12 w-full rounded-xs border border-ink-200 bg-white ps-12 pe-4 text-base text-ink-900 placeholder:text-ink-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30" />
          </label>
          <button className="h-12 rounded-xs bg-brand-600 px-6 text-base font-semibold text-white transition-colors hover:bg-brand-700">{t("searchpage.button")}</button>
        </form>
      </PageHero>
      <div className="container-x section-y">
        {q.trim().length < 2 ? (
          <p className="text-ink-600">{t("searchpage.minChars")}</p>
        ) : total === 0 ? (
          <p className="text-lg text-ink-600">{t("searchpage.noMatch", { q })}</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {r.athletes.length > 0 && (
              <Group title={t("searchpage.athletes")} count={r.athletes.length}>
                {r.athletes.map(({ athlete: a, discipline }) => (
                  <Row key={a.id} href={`/athletes/${a.slug}`} title={fullName(a)} meta={discipline?.name ?? ""} demo={a.isDemo} />
                ))}
              </Group>
            )}
            {r.competitions.length > 0 && (
              <Group title={t("searchpage.competitions")} count={r.competitions.length}>
                {r.competitions.map((c) => (
                  <Row key={c.id} href={`/competitions/${c.slug}`} title={c.name} meta={`${c.city ?? ""} · ${formatDateRange(c.startDate, c.endDate, locale)}`} demo={c.isDemo} />
                ))}
              </Group>
            )}
            {r.news.length > 0 && (
              <Group title={t("searchpage.news")} count={r.news.length}>
                {r.news.map((n) => (
                  <Row key={n.id} href={`/news/${n.slug}`} title={n.title} meta={formatDate(n.publishedAt, undefined, locale)} demo={n.isDemo} />
                ))}
              </Group>
            )}
            {r.events.length > 0 && (
              <Group title={t("searchpage.events")} count={r.events.length}>
                {r.events.map((e) => (
                  <Row key={e.id} href={`/events/${e.slug}`} title={e.title} meta={`${e.location ?? ""} · ${formatDate(e.startAt, undefined, locale)}`} demo={e.isDemo} />
                ))}
              </Group>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-h3 mb-4 text-ink-950">
        {title} <span className="text-ink-500">({count})</span>
      </h2>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

function Row({ href, title, meta, demo }: { href: string; title: string; meta: string; demo?: boolean }) {
  return (
    <li className="card card-interactive relative p-4">
      <Link href={href} className="block after:absolute after:inset-0 after:content-['']">
        <span className="flex items-center gap-2 font-semibold text-ink-950">
          {title} {demo && <DemoBadge />}
        </span>
        <span className="text-[0.9375rem] text-ink-600">{meta}</span>
      </Link>
    </li>
  );
}
