import type { Metadata } from "next";
import Link from "next/link";
import { getBoard, getCommittees, getDocuments } from "@/lib/queries";
import { getT } from "@/lib/i18n/server";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/badge";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("gov.meta.title"), description: t("gov.meta.desc"), alternates: { canonical: "/about/governance" } };
}

export default async function GovernancePage() {
  const { t } = await getT();
  const [board, committees, docs] = await Promise.all([getBoard(), getCommittees(), getDocuments()]);
  const policies = docs.filter((d) => d.category === "governance" || d.category === "integrity");
  const exec = board.filter((b) => b.group === "executive");

  return (
    <>
      <PageHero
        eyebrow={t("gov.eyebrow")}
        title={t("gov.title")}
        intro={t("gov.intro")}
        crumbs={[{ label: t("about.crumb.federation"), href: "/about" }, { label: t("gov.crumb") }]}
      />

      <section aria-labelledby="structure-title" className="container-x section-y">
        <p className="text-eyebrow mb-3 text-brand-700">{t("gov.structureEyebrow")}</p>
        <h2 id="structure-title" className="text-h2 text-ink-950">
          {t("gov.structureHeading")}
        </h2>

        {/* Org chart */}
        <div className="mt-10 overflow-x-auto pb-4">
          <div className="min-w-[760px]">
            <div className="card mx-auto w-72 border-brand-200 bg-brand-50 p-5 text-center">
              <p className="text-eyebrow text-brand-700">{t("gov.assembly")}</p>
              <p className="mt-1 text-sm text-ink-600">{t("gov.clubs")}</p>
            </div>
            <div className="mx-auto h-8 w-px bg-ink-300" />
            <div className="card mx-auto w-80 p-5 text-center">
              <p className="text-eyebrow text-ink-500">{t("gov.boardOfDirectors")}</p>
              <p className="mt-2 text-sm text-ink-700">{exec.map((e) => e.title).join(" · ")}</p>
            </div>
            <div className="mx-auto h-8 w-px bg-ink-300" />
            <div className="relative mx-auto h-px bg-ink-300" style={{ width: `${(100 * (committees.length - 1)) / committees.length}%` }} />
            <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${committees.length}, minmax(0, 1fr))` }}>
              {committees.map((c) => (
                <li key={c.id} className="flex flex-col items-center">
                  <span className="h-6 w-px bg-ink-300" />
                  <div className="card w-full p-4 text-center">
                    <p className="text-sm font-bold leading-tight text-ink-950">{c.name}</p>
                    <p className="mt-1 text-xs text-ink-600">{c.chair}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-500">{t("gov.structureNote")}</p>
      </section>

      <section aria-labelledby="committees-title" className="section-y bg-pearl">
        <div className="container-x">
          <h2 id="committees-title" className="text-h2 text-ink-950">
            {t("gov.committees")}
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {committees.map((c) => (
              <li key={c.id} className="card flex flex-col gap-2 p-6">
                <h3 className="text-h3 text-ink-950">{c.name}</h3>
                <p className="text-[0.9375rem] font-semibold text-ink-700">{t("gov.head", { name: c.chair ?? "" })}</p>
                <p className="text-ink-600">
                  {c.remit} {c.isDemo && <DemoBadge className="ms-1 align-middle" />}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="policies-title" className="container-x section-y">
        <h2 id="policies-title" className="text-h2 text-ink-950">
          {t("gov.policies")}
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {policies.map((d) => (
            <li key={d.id} className="card card-interactive relative flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-semibold text-ink-950">{d.title}</p>
                <p className="mt-1 text-[0.9375rem] text-ink-600">{d.description}</p>
              </div>
              {d.url ? (
                <Link href={d.url} className="inline-flex min-h-11 shrink-0 items-center font-semibold text-brand-700 hover:underline after:absolute after:inset-0 after:content-['']">
                  {t("gov.open")}
                </Link>
              ) : (
                <DemoBadge />
              )}
            </li>
          ))}
        </ul>
        <ButtonLink href="/about/documents" variant="secondary" className="mt-8">
          {t("gov.allDocs")}
        </ButtonLink>
      </section>
    </>
  );
}
