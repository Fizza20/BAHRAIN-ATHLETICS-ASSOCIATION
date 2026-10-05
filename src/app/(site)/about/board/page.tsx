import type { Metadata } from "next";
import { getBoard } from "@/lib/queries";
import { boardSource } from "@/db/seed-data/real";
import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dict";
import { PageHero } from "@/components/site/page-hero";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("board.meta.title"), description: t("board.meta.desc"), alternates: { canonical: "/about/board" } };
}

const ROLE_KEYS: Record<string, DictKey> = {
  "President": "board.role.President",
  "Vice President": "board.role.VicePresident",
  "Secretary General": "board.role.SecretaryGeneral",
  "Financial Secretary": "board.role.FinancialSecretary",
  "Head of Women Committee": "board.role.HeadWomen",
  "Head of Media and Development Committee": "board.role.HeadMedia",
  "Head of Public Relations": "board.role.HeadPR",
  "Head of Anti-Doping Committee": "board.role.HeadAntiDoping",
  "Head of the Referees and Competitions": "board.role.HeadReferees",
  "Head of Investment and Marketing Committee": "board.role.HeadInvestment",
  "National Team Manager": "board.role.NationalTeamManager",
};

export default async function BoardPage() {
  const { t, locale } = await getT();
  const ar = locale === "ar";
  const roleOf = (title: string) => (ar && ROLE_KEYS[title] ? t(ROLE_KEYS[title]) : title);
  const GROUP_LABEL = { executive: t("board.group.executive"), committee: t("board.group.committee"), administration: t("board.group.administration") } as const;
  const board = await getBoard();
  const groups = (["executive", "committee", "administration"] as const).map((g) => ({ g, members: board.filter((b) => b.group === g) }));
  const president = board.find((b) => b.title === "President");

  return (
    <>
      <PageHero
        eyebrow={t("board.eyebrow")}
        title={t("board.title")}
        intro={t("board.intro")}
        crumbs={[{ label: t("about.crumb.federation"), href: "/about" }, { label: t("board.crumb") }]}
      />
      <div className="container-x section-y">
        {president && (
          <div className="grid items-center gap-6 border-b border-line pb-10 md:grid-cols-12">
            <div className="md:col-span-3">
              <Initials name={president.name} size="lg" />
            </div>
            <div className="md:col-span-9">
              <p className="text-eyebrow text-brand-700">{roleOf(president.title)}</p>
              <h2 className="text-h1 mt-3 text-ink-950">{president.name}</h2>
            </div>
          </div>
        )}
        {groups.map(({ g, members }) => {
          const list = members.filter((m) => m.id !== president?.id);
          if (!list.length) return null;
          return (
            <section key={g} aria-labelledby={`g-${g}`} className="mt-12">
              <h2 id={`g-${g}`} className="text-h2 mb-6 text-ink-950">
                {GROUP_LABEL[g]}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => (
                  <li key={m.id} className="card flex items-center gap-5 p-5">
                    <Initials name={m.name} />
                    <div>
                      <p className="text-lg font-bold leading-tight text-ink-950">{m.name}</p>
                      <p className="mt-1 text-[0.9375rem] text-ink-600">{roleOf(m.title)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <p className="mt-10 text-sm text-ink-500">
          {t("board.namesNote")}{" "}
          <a href={boardSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            baa.bh/board-members
          </a>
          . {t("board.portraits")}
        </p>
      </div>
    </>
  );
}

function Initials({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const parts = name.split(" ").filter((p) => p.length > 1);
  const ini = `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`;
  return (
    <span
      aria-hidden
      className={
        size === "lg"
          ? "flex aspect-square w-full max-w-[220px] items-center justify-center rounded-md bg-brand-50 text-7xl font-extrabold text-brand-700"
          : "flex size-16 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xl font-bold text-brand-700"
      }
    >
      {ini}
    </span>
  );
}
