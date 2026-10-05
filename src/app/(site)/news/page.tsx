import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getNews } from "@/lib/queries";
import { PageHero, EmptyState } from "@/components/site/page-hero";
import { LeadStory, StoryCard, CompactStory } from "@/components/domain/news-story";
import { NEWS_CATEGORY_LABEL } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("news.meta.title"),
    description: t("news.meta.desc"),
    alternates: { canonical: "/news" },
  };
}

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const { t } = await getT();
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const page = Number(sp.page ?? 1) || 1;
  const { rows, pages, total } = await getNews({ category, page });
  const [lead, ...rest] = rows;
  const grid = rest.slice(0, 6);
  const compact = rest.slice(6);
  const qs = (p: number) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/news?${s}` : "/news";
  };

  return (
    <>
      <PageHero eyebrow={t("news.eyebrow")} title={t("news.title")} intro={t("news.intro")} crumbs={[{ label: t("news.title") }]} />
      <div className="container-x pb-16 md:pb-24">
        <nav aria-label={t("news.categories")} className="sticky top-[72px] z-20 -mx-4 border-b border-line bg-white/95 px-4 py-4 backdrop-blur md:mx-0 md:px-0">
          <ul className="scrollbar-none flex gap-2 overflow-x-auto">
            {["", ...Object.keys(NEWS_CATEGORY_LABEL)].map((k) => (
              <li key={k}>
                <Link
                  href={k ? `/news?category=${k}` : "/news"}
                  scroll={false}
                  aria-current={(category ?? "") === k ? "page" : undefined}
                  className="tab-pill"
                >
                  {k ? t(keyOf("newscat", k)) : t("news.all")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {total === 0 ? (
          <div className="mt-10">
            <EmptyState title={t("news.empty")} />
          </div>
        ) : (
          <>
            {lead && (
              <div className="mt-8">
                <LeadStory s={lead} priority />
              </div>
            )}
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {grid.map((s) => (
                <StoryCard key={s.slug} s={s} />
              ))}
            </div>
            {compact.length > 0 && (
              <div className="mt-10">
                <h2 className="text-h3 mb-4">{t("news.older")}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {compact.map((s) => (
                    <CompactStory key={s.slug} s={s} />
                  ))}
                </div>
              </div>
            )}
            {pages > 1 && (
              <nav aria-label={t("news.pagination")} className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
                {page > 1 ? (
                  <ButtonLink href={qs(page - 1)} variant="secondary" arrow={false}>
                    <ArrowLeft className="size-4" aria-hidden /> {t("news.newer")}
                  </ButtonLink>
                ) : (
                  <span />
                )}
                <span className="text-[0.9375rem] tabular text-ink-600">{t("news.pageOf", { page, pages })}</span>
                {page < pages ? (
                  <ButtonLink href={qs(page + 1)} variant="secondary" arrow={false}>
                    {t("news.olderPage")} <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}
