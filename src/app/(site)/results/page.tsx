import type { Metadata } from "next";
import { db, schema as s } from "@/db";
import { asc } from "drizzle-orm";
import { getDisciplines, getResults, getResultYears } from "@/lib/queries";
import { PageHero, EmptyState, HeroStats } from "@/components/site/page-hero";
import { FilterBar, Pagination } from "@/components/ui/filters";
import { ResultsTable } from "@/components/domain/results-table";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("results.title"),
    description: t("results.metaDesc"),
    alternates: { canonical: "/results" },
  };
}

export default async function ResultsPage({ searchParams }: PageProps<"/results">) {
  const { t } = await getT();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const page = Number(str("page") ?? 1) || 1;

  const [data, disciplines, years, athletes, competitions] = await Promise.all([
    getResults({
      q: str("q"),
      discipline: str("discipline"),
      athlete: str("athlete"),
      competition: str("competition"),
      year: str("year"),
      gender: str("gender"),
      category: str("category"),
      round: str("round"),
      medal: str("medal"),
      sort: str("sort"),
      page,
    }),
    getDisciplines(),
    getResultYears(),
    db.select({ slug: s.athletes.slug, firstName: s.athletes.firstName, lastName: s.athletes.lastName }).from(s.athletes).orderBy(asc(s.athletes.lastName)),
    db.select({ slug: s.competitions.slug, name: s.competitions.name }).from(s.competitions).orderBy(asc(s.competitions.name)),
  ]);

  return (
    <>
      <PageHero
        eyebrow={t("results.title")}
        title={t("results.title")}
        intro={t("results.intro")}
        crumbs={[{ label: t("results.title") }]}
        aside={<HeroStats items={[{ label: t("results.stat.matching"), value: data.total }, { label: t("results.stat.seasons"), value: years.length }]} />}
      />
      <div className="container-x pb-16 md:pb-24">
        <FilterBar
          searchPlaceholder={t("results.searchPlaceholder")}
          count={data.total}
          noun={data.total === 1 ? t("common.result") : t("common.results")}
          filters={[
            { key: "discipline", label: t("results.filter.event"), options: disciplines.map((d) => ({ value: d.slug, label: d.name })) },
            { key: "athlete", label: t("results.filter.athlete"), options: athletes.map((a) => ({ value: a.slug, label: `${a.lastName}, ${a.firstName}` })) },
            { key: "competition", label: t("results.filter.competition"), options: competitions.map((c) => ({ value: c.slug, label: c.name })) },
            { key: "year", label: t("results.filter.year"), options: years.map((y) => ({ value: y, label: y })) },
            { key: "gender", label: t("results.filter.gender"), options: [{ value: "women", label: t("gender.women") }, { value: "men", label: t("gender.men") }] },
            { key: "category", label: t("results.filter.category"), options: ["senior", "u23", "u20", "u18", "u16"].map((c) => ({ value: c, label: t(keyOf("category", c)) })) },
            { key: "round", label: t("results.filter.round"), options: [{ value: "final", label: t("round.final") }, { value: "semi-final", label: t("round.semi-final") }, { value: "heat", label: t("round.heat") }] },
            { key: "medal", label: t("results.filter.type"), options: [{ value: "win", label: t("results.type.win") }, { value: "any", label: t("results.type.any") }, { value: "record", label: t("results.type.record") }] },
          ]}
          sorts={[
            { value: "", label: t("results.sort.newest") },
            { value: "date-asc", label: t("results.sort.oldest") },
            { value: "position", label: t("results.sort.position") },
            { value: "athlete", label: t("results.sort.athlete") },
            { value: "mark", label: t("results.sort.mark") },
          ]}
        >
          <div className="mt-6">
            {data.rows.length ? (
              <ResultsTable rows={data.rows} caption={t("results.caption")} />
            ) : (
              <EmptyState title={t("results.empty.title")} body={t("results.empty.body")} />
            )}
            <Pagination page={data.page} pages={data.pages} />
            <p className="mt-6 text-sm text-ink-600">{t("results.note")}</p>
          </div>
        </FilterBar>
      </div>
    </>
  );
}
