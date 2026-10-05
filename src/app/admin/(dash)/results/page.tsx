import type { Metadata } from "next";
import { and, count, desc, eq, isNotNull, like, or, sql, type SQL } from "drizzle-orm";
import { Timer } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { ordinal, ROUND_LABEL } from "@/lib/utils";
import { competitionOptions, disciplineOptions } from "@/lib/admin-queries";
import { bulkDeleteResults, deleteResult } from "@/lib/actions/results";
import { DemoBadge, MedalDot, RecordTag } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Results" };
const BASE = "/admin/results";
const SORTS = ["date", "athlete", "discipline", "mark", "position"] as const;

export default async function ResultsPage({ searchParams }: PageProps<"/admin/results">) {
  const user = await requireUser("results");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "date", dir: "desc", pageSize: 20 });
  const canWrite = can(user.role, "results", "write");
  const canDelete = can(user.role, "results", "delete");

  const where: SQL[] = [];
  if (q) where.push(or(like(s.athletes.firstName, `%${q}%`), like(s.athletes.lastName, `%${q}%`), like(s.results.mark, `%${q}%`), like(s.competitions.name, `%${q}%`))!);
  if (p.discipline) where.push(eq(s.results.disciplineId, Number(p.discipline) || 0));
  if (p.competition) where.push(eq(s.results.competitionId, Number(p.competition) || 0));
  if (p.year && /^\d{4}$/.test(p.year)) where.push(like(s.results.date, `${p.year}%`));
  if (p.medal === "any") where.push(isNotNull(s.results.medal));
  if (p.record === "any") where.push(isNotNull(s.results.record));
  if (p.source === "demo") where.push(eq(s.results.isDemo, true));
  if (p.source === "real") where.push(eq(s.results.isDemo, false));
  const w = where.length ? and(...where) : undefined;
  const col = { date: s.results.date, athlete: s.athletes.lastName, discipline: s.disciplines.name, mark: s.results.markValue, position: s.results.position }[sort];

  const base = () =>
    db
      .select({ r: s.results, firstName: s.athletes.firstName, lastName: s.athletes.lastName, slug: s.athletes.slug, discipline: s.disciplines.name, competition: s.competitions.shortName, competitionName: s.competitions.name })
      .from(s.results)
      .innerJoin(s.athletes, eq(s.results.athleteId, s.athletes.id))
      .innerJoin(s.disciplines, eq(s.results.disciplineId, s.disciplines.id))
      .leftJoin(s.competitions, eq(s.results.competitionId, s.competitions.id));

  const [rows, [{ n: total }], disciplines, competitions, years] = await Promise.all([
    base().where(w).orderBy(dir === "asc" ? sql`${col} asc nulls last` : sql`${col} desc nulls last`, desc(s.results.id)).limit(pageSize).offset(offset),
    db
      .select({ n: count() })
      .from(s.results)
      .innerJoin(s.athletes, eq(s.results.athleteId, s.athletes.id))
      .leftJoin(s.competitions, eq(s.results.competitionId, s.competitions.id))
      .where(w),
    disciplineOptions(),
    competitionOptions(),
    db.selectDistinct({ y: sql<string>`substr(${s.results.date}, 1, 4)` }).from(s.results).orderBy(desc(sql`1`)),
  ]);
  const bulk = canDelete ? [{ label: "Delete", action: bulkDeleteResults, confirm: "Delete {n} result(s)? Personal bests on athlete pages are recalculated." }] : [];

  return (
    <div>
      <PageHeader
        eyebrow="Sports data"
        title="Results"
        description="Every mark recorded for Bahraini athletes. Marks are parsed to numbers so personal and season bests stay correct."
        actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ Record result</ButtonLink>}
      />
      <Toolbar
        base={BASE}
        q={q}
        placeholder="Search athlete, mark or competition"
        keep={{ sort: p.sort, dir: p.dir }}
        filters={[
          { name: "discipline", label: "Discipline", options: disciplines, value: p.discipline },
          { name: "competition", label: "Competition", options: competitions, value: p.competition },
          { name: "year", label: "Year", options: years.map((y) => ({ value: y.y, label: y.y })), value: p.year },
          { name: "medal", label: "Medal", options: [{ value: "any", label: "Medal won" }], value: p.medal },
          { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<Timer className="size-5" aria-hidden />} title="No results found" description="Adjust the filters, or record a new result." action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ Record result</ButtonLink>} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.r.id)} /></Th>}
                <SortTh base={BASE} p={p} col="athlete" sort={sort} dir={dir}>Athlete</SortTh>
                <SortTh base={BASE} p={p} col="discipline" sort={sort} dir={dir}>Discipline</SortTh>
                <Th>Competition</Th>
                <SortTh base={BASE} p={p} col="mark" sort={sort} dir={dir} align="right">Mark</SortTh>
                <SortTh base={BASE} p={p} col="position" sort={sort} dir={dir}>Place</SortTh>
                <SortTh base={BASE} p={p} col="date" sort={sort} dir={dir}>Date</SortTh>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ r, firstName, lastName, slug, discipline, competition, competitionName }) => {
                const label = `${firstName} ${lastName}, ${discipline} ${r.mark ?? ""}`.trim();
                return (
                  <tr key={r.id} className={trCls}>
                    {bulk.length > 0 && <Td><RowCheck id={r.id} label={label} /></Td>}
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-950">{firstName} {lastName}</span>
                        {r.isDemo && <DemoBadge />}
                        <SourceLink href={r.sourceUrl} />
                      </div>
                    </Td>
                    <Td className="text-ink-700">
                      {discipline}
                      {r.round !== "final" && r.round !== "single" && <span className="block text-xs text-ink-500">{ROUND_LABEL[r.round]}</span>}
                    </Td>
                    <Td className="max-w-56 truncate text-ink-700" title={competitionName ?? undefined}>{competition ?? competitionName ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1.5">
                        {r.isSB && <abbr title="Season best" className="text-[0.625rem] font-bold text-ink-500 no-underline">SB</abbr>}
                        {r.record && <RecordTag record={r.record} />}
                        <span className="text-mark text-base text-ink-950">{r.mark ?? "—"}</span>
                      </span>
                      {r.wind && <span className="block text-[0.6875rem] text-ink-400 tabular">wind {r.wind}</span>}
                    </Td>
                    <Td className="whitespace-nowrap">{r.medal ? <MedalDot medal={r.medal} /> : <span className="tabular text-ink-700">{ordinal(r.position)}</span>}</Td>
                    <Td className="whitespace-nowrap text-xs tabular text-ink-500">{r.date}</Td>
                    <Td>
                      <RowActions>
                        <ViewOnSite href={`/athletes/${slug}`} label="View athlete on site" />
                        {canWrite && <EditLink href={`${BASE}/${r.id}`} label={label} />}
                        {canDelete && <DeleteButton action={deleteResult} id={r.id} label={label} />}
                      </RowActions>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </BulkScope>
      )}
      <Pagination base={BASE} p={p} page={page} pageSize={pageSize} total={total} />
      {!canWrite && <p className="mt-4 text-xs text-ink-500">Your role can view results. Results managers record and edit them.</p>}
    </div>
  );
}
