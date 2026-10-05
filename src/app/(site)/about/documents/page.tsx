import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowUpRight } from "lucide-react";
import { getDocuments } from "@/lib/queries";
import { getT } from "@/lib/i18n/server";
import { PageHero } from "@/components/site/page-hero";
import { DemoBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("docs.meta.title"), description: t("docs.meta.desc"), alternates: { canonical: "/about/documents" } };
}

export default async function DocumentsPage({ searchParams }: PageProps<"/about/documents">) {
  const { t, locale } = await getT();
  const CATS = {
    governance: t("docs.cat.governance"),
    integrity: t("docs.cat.integrity"),
    competition: t("docs.cat.competition"),
    forms: t("docs.cat.forms"),
    reports: t("docs.cat.reports"),
  } as const;
  const sp = await searchParams;
  const cat = typeof sp.category === "string" ? sp.category : undefined;
  const docs = await getDocuments(cat);

  return (
    <>
      <PageHero eyebrow={t("docs.eyebrow")} title={t("docs.title")} intro={t("docs.intro")} crumbs={[{ label: t("about.crumb.federation"), href: "/about" }, { label: t("docs.crumb") }]} />
      <div className="container-x section-y">
        <nav aria-label={t("docs.catNav")} className="scrollbar-none mb-8 flex gap-2 overflow-x-auto">
          {[["", t("docs.all")], ...Object.entries(CATS)].map(([k, l]) => (
            <Link
              key={k}
              href={k ? `/about/documents?category=${k}` : "/about/documents"}
              aria-current={(cat ?? "") === k ? "page" : undefined}
              className="tab-pill"
            >
              {l}
            </Link>
          ))}
        </nav>
        <table className="w-full text-start">
          <caption className="sr-only">{t("docs.caption")}</caption>
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-line text-sm text-ink-600">
              <th scope="col" className="py-4 font-semibold">{t("docs.col.document")}</th>
              <th scope="col" className="py-4 font-semibold">{t("docs.col.category")}</th>
              <th scope="col" className="py-4 font-semibold">{t("docs.col.published")}</th>
              <th scope="col" className="py-4 text-end font-semibold">
                <span className="sr-only">{t("docs.col.action")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="flex flex-col gap-2 border-b border-line py-5 md:table-row md:py-0">
                <td className="md:py-5">
                  <span className="flex items-start gap-4">
                    <FileText className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                    <span>
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        {d.title} {d.isDemo && <DemoBadge />}
                      </span>
                      <span className="mt-1 block text-[0.9375rem] text-ink-600">{d.description}</span>
                    </span>
                  </span>
                </td>
                <td className="ps-9 text-[0.9375rem] text-ink-600 md:py-5 md:ps-0">{CATS[d.category]}</td>
                <td className="ps-9 text-[0.9375rem] tabular text-ink-600 md:py-5 md:ps-0">{formatDate(d.publishedAt, undefined, locale)}</td>
                <td className="ps-9 md:py-5 md:ps-0 md:text-end">
                  {d.url ? (
                    <Link href={d.url} className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-700 hover:underline">
                      {t("docs.open")} <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-500">{t("docs.pending")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
