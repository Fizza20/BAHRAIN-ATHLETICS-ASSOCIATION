import type { Metadata } from "next";
import { getAthletes, getDisciplines } from "@/lib/queries";
import { PageHero, EmptyState } from "@/components/site/page-hero";
import { FilterBar } from "@/components/ui/filters";
import { AthleteCard } from "@/components/domain/athlete-card";
import { photos } from "@/lib/images";
import { getT } from "@/lib/i18n/server";
import { keyOf } from "@/lib/i18n/dict";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("athletes.title"),
    description: t("athletes.metaDesc"),
    alternates: { canonical: "/athletes" },
  };
}

const GROUPS = ["sprints", "middle-distance", "long-distance", "hurdles", "jumps", "throws", "road", "combined"];

export default async function AthletesPage({ searchParams }: PageProps<"/athletes">) {
  const { t } = await getT();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const [rows, disciplines] = await Promise.all([
    getAthletes({ q: str("q"), discipline: str("discipline"), group: str("group"), gender: str("gender"), category: str("category"), status: str("status"), sort: str("sort") }),
    getDisciplines(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={t("athletes.title")}
        title={t("athletes.title")}
        intro={t("athletes.intro")}
        crumbs={[{ label: t("athletes.title") }]}
        image={photos.raceStart.src}
      />
      <div className="container-x pb-16 md:pb-24">
        <FilterBar
          searchPlaceholder={t("athletes.searchPlaceholder")}
          count={rows.length}
          noun={rows.length === 1 ? t("athletes.noun.one") : t("athletes.noun.many")}
          filters={[
            { key: "group", label: t("athletes.filter.group"), options: GROUPS.map((g) => ({ value: g, label: t(keyOf("athletes.group", g)) })) },
            { key: "discipline", label: t("athletes.filter.event"), options: disciplines.map((d) => ({ value: d.slug, label: d.name })) },
            { key: "gender", label: t("athletes.filter.gender"), options: [{ value: "women", label: t("gender.women") }, { value: "men", label: t("gender.men") }] },
            { key: "category", label: t("athletes.filter.category"), options: ["senior", "u23", "u20", "u18", "u16"].map((c) => ({ value: c, label: t(keyOf("category", c)) })) },
            { key: "status", label: t("athletes.filter.status"), options: [{ value: "active", label: t("athlete.status.active") }, { value: "retired", label: t("athlete.status.retired") }] },
          ]}
          sorts={[
            { value: "", label: t("athletes.sort.featured") },
            { value: "name", label: t("athletes.sort.name") },
            { value: "name-desc", label: t("athletes.sort.nameDesc") },
            { value: "discipline", label: t("athletes.sort.event") },
            { value: "results", label: t("athletes.sort.results") },
          ]}
        >
          {rows.length === 0 ? (
            <div className="mt-8">
              <EmptyState title={t("athletes.empty.title")} body={t("athletes.empty.body")} />
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map((r) => (
                <li key={r.athlete.id}>
                  <AthleteCard
                    a={r.athlete}
                    discipline={r.discipline}
                    stat={r.results > 0 ? { label: r.results === 1 ? t("common.result") : t("common.results"), value: String(r.results) } : undefined}
                  />
                </li>
              ))}
            </ul>
          )}
        </FilterBar>
      </div>
    </>
  );
}
