import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { getNewsBySlug } from "@/lib/queries";
import { Breadcrumbs } from "@/components/site/page-hero";
import { Photo } from "@/components/ui/photo";
import { DemoBadge } from "@/components/ui/badge";
import { StoryCard } from "@/components/domain/news-story";
import { ShareBar } from "@/components/domain/share";
import { formatDate, fullName, SITE_URL } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";
import { jsonLd as jsonLdScript } from "@/lib/security/json-ld";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { t } = await getT();
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) return { title: t("news.notFound") };
  return {
    title: n.title,
    description: n.excerpt ?? undefined,
    alternates: { canonical: `/news/${n.slug}` },
    openGraph: { type: "article", title: n.title, description: n.excerpt ?? undefined, publishedTime: n.publishedAt ?? undefined, images: n.imageUrl ? [{ url: `${n.imageUrl}?w=1200&h=630&fit=crop` }] : undefined },
    robots: n.isDemo ? { index: false } : undefined,
  };
}

export default async function NewsArticlePage({ params }: PageProps<"/news/[slug]">) {
  const { t, locale } = await getT();
  const { slug } = await params;
  const n = await getNewsBySlug(slug);
  if (!n) notFound();
  const url = `${SITE_URL}/news/${n.slug}`;
  const paragraphs = (n.body ?? "").split(/\n\s*\n/).filter(Boolean);
  const athletes = n.athletes.map((x) => x.athlete);
  const catLabel = t(keyOf("newscat", n.category));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: n.title,
    datePublished: n.publishedAt,
    author: { "@type": "Organization", name: n.author ?? "BAA Media" },
    publisher: { "@type": "SportsOrganization", name: "Bahrain Athletics Association", logo: `${SITE_URL}/brand/baa-crest.png` },
    image: n.imageUrl ? [n.imageUrl] : undefined,
    mainEntityOfPage: url,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <header className="under-header border-b border-line bg-pearl">
        <div className="container-x py-8 md:py-12">
          <Breadcrumbs items={[{ label: t("nav.news"), href: "/news" }, { label: catLabel, href: `/news?category=${n.category}` }, { label: t("news.crumbStory") }]} />
          <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-eyebrow flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-500">
                <span className="text-brand-700">{catLabel}</span>
                <span aria-hidden>·</span>
                <time dateTime={n.publishedAt ?? undefined}>{formatDate(n.publishedAt, { day: "numeric", month: "long", year: "numeric" }, locale)}</time>
                <span aria-hidden>·</span>
                {n.author}
                {n.isDemo && <DemoBadge />}
              </p>
              <h1 className="text-h1 mt-4 text-ink-950">{n.title}</h1>
              {n.excerpt && <p className="mt-4 text-lg text-ink-600">{n.excerpt}</p>}
            </div>
            <div className="lg:col-span-5">
              <figure>
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-ink-100">
                  <Photo src={n.imageUrl} alt="" priority sizes="(min-width:1024px) 40vw, 100vw" />
                </div>
                <figcaption className="mt-2 text-sm text-ink-500">{t("news.imageCaption")}</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </header>

      <div className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="max-w-3xl space-y-6 text-lg leading-[1.8] text-ink-800">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {n.sourceUrl && (
              <p className="mt-10 border-s-2 border-line ps-4 text-[0.9375rem] text-ink-600">
                {t("news.basedOn")}{" "}
                <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-700 hover:underline">
                  {t("news.readOnBaa")} <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </p>
            )}
            <div className="mt-10 border-t border-line pt-6">
              <ShareBar url={url} title={n.title} />
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            {athletes.length > 0 && (
              <div className="card p-6">
                <h2 className="text-eyebrow text-ink-500">{t("news.athletes")}</h2>
                <ul className="mt-2 divide-y divide-line">
                  {athletes.map((a) => (
                    <li key={a.id}>
                      <Link href={`/athletes/${a.slug}`} className="group flex min-h-11 items-center justify-between py-3">
                        <span>
                          <span className="block font-semibold text-ink-900 group-hover:text-brand-700">{fullName(a)}</span>
                          <span className="text-[0.9375rem] text-ink-600">{a.primaryDiscipline?.name}</span>
                        </span>
                        <ArrowUpRight className="size-5 text-ink-500 group-hover:text-brand-600" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {n.competition && (
              <div className="card card-interactive relative p-6">
                <p className="text-eyebrow text-ink-500">{t("news.competition")}</p>
                <Link href={`/competitions/${n.competition.slug}`} className="text-h3 mt-3 block text-ink-900 after:absolute after:inset-0 after:content-[''] hover:text-brand-700">
                  {n.competition.name}
                </Link>
                <p className="mt-1 text-[0.9375rem] text-ink-600">
                  {n.competition.city}, {n.competition.country}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-700">
                  {t("news.hubLink")} <ArrowRight className="size-4" aria-hidden />
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {n.related.length > 0 && (
        <section aria-labelledby="related-title" className="section-y border-t border-line bg-pearl">
          <div className="container-x">
            <h2 id="related-title" className="text-h2 mb-8">
              {t("news.related")}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {n.related.map((r) => (
                <StoryCard key={r.id} s={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
