import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { Trophy } from "lucide-react";
import { db, schema as s } from "@/db";
import { COMPETITION_LEVEL, COMPETITION_STATUS } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatDateRange, LEVEL_LABEL } from "@/lib/utils";
import { effectiveStatus, STATUS_LABEL } from "@/lib/status";
import { bulkDeleteCompetitions, deleteCompetition } from "@/lib/actions/competitions";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Competitions" };
const BASE = "/admin/competitions";
const SORTS = ["name", "level", "date", "city", "results"] as const;

export default async function CompetitionsPage({ searchParams }: PageProps<"/admin/competitions">) {
  const user = await requireUser("competitions");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "date", dir: "desc" });
  const canWrite = can(user.role, "competitions", "write");
  const canDelete = can(user.role, "competitions", "delete");

  const where: SQL[] = [];
  if (q) where.push(or(like(s.competitions.name, `%${q}%`), like(s.competitions.shortName, `%${q}%`), like(s.competitions.city, `%${q}%`), like(s.competitions.country, `%${q}%`))!);
  if (p.level && (COMPETITION_LEVEL as readonly string[]).includes(p.level)) where.push(eq(s.competitions.level, p.level as "global"));
  if (p.status && (COMPETITION_STATUS as readonly string[]).includes(p.status)) where.push(eq(s.competitions.status, p.status as "upcoming"));
  if (p.year && /^\d{4}$/.test(p.year)) where.push(like(s.competitions.startDate, `${p.year}%`));
  if (p.source === "demo") where.push(eq(s.competitions.isDemo, true));
  if (p.source === "real") where.push(eq(s.competitions.isDemo, false));
  const w = where.length ? and(...where) : undefined;

  const resultCount = sql<number>`(select count(*) from ${s.results} where ${s.results.competitionId} = ${s.competitions.id})`;
  const col = { name: s.competitions.name, level: s.competitions.level, date: s.competitions.startDate, city: s.competitions.city, results: resultCount }[sort];

  const [rows, [{ n: total }], years] = await Promise.all([
    db
      .select({ c: s.competitions, results: resultCount })
      .from(s.competitions)
      .where(w)
      .orderBy(dir === "asc" ? asc(col) : desc(col), asc(s.competitions.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(s.competitions).where(w),
    db.selectDistinct({ y: sql<string>`substr(${s.competitions.startDate}, 1, 4)` }).from(s.competitions).orderBy(desc(sql`1`)),
  ]);

  const bulk = canDelete ? [{ label: "Delete", action: bulkDeleteCompetitions, confirm: "Delete {n} competition(s)? Results stay but lose their competition link." }] : [];

  return (
    <div>
      <PageHeader
        eyebrow="Sports data"
        title="Competitions"
        description="Championships and meetings where Bahraini athletes compete. Status updates itself from the dates unless postponed or cancelled."
        actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ New competition</ButtonLink>}
      />
      <Toolbar
        base={BASE}
        q={q}
        placeholder="Search name or city"
        keep={{ sort: p.sort, dir: p.dir }}
        filters={[
          { name: "level", label: "Level", options: COMPETITION_LEVEL.map((l) => ({ value: l, label: LEVEL_LABEL[l] })), value: p.level },
          { name: "status", label: "Status", options: COMPETITION_STATUS.map((v) => ({ value: v, label: STATUS_LABEL[v] })), value: p.status },
          { name: "year", label: "Year", options: years.filter((y) => y.y).map((y) => ({ value: y.y, label: y.y })), value: p.year },
          { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<Trophy className="size-5" aria-hidden />} title="No competitions found" description="Adjust the filters or add a competition." action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ New competition</ButtonLink>} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.c.id)} /></Th>}
                <SortTh base={BASE} p={p} col="name" sort={sort} dir={dir}>Competition</SortTh>
                <SortTh base={BASE} p={p} col="level" sort={sort} dir={dir}>Level</SortTh>
                <SortTh base={BASE} p={p} col="date" sort={sort} dir={dir}>Dates</SortTh>
                <SortTh base={BASE} p={p} col="city" sort={sort} dir={dir}>Location</SortTh>
                <Th>Status</Th>
                <SortTh base={BASE} p={p} col="results" sort={sort} dir={dir} align="right">Results</SortTh>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, results }) => (
                <tr key={c.id} className={trCls}>
                  {bulk.length > 0 && <Td><RowCheck id={c.id} label={c.name} /></Td>}
                  <Td>
                    <div className="flex items-center gap-2">
                      {canWrite ? (
                        <Link href={`${BASE}/${c.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{c.name}</Link>
                      ) : (
                        <span className="font-semibold text-ink-950">{c.name}</span>
                      )}
                      {c.isDemo && <DemoBadge />}
                      <SourceLink href={c.sourceUrl} />
                    </div>
                    {c.shortName && <p className="text-xs text-ink-500">{c.shortName}</p>}
                  </Td>
                  <Td className="text-ink-700">{LEVEL_LABEL[c.level]}</Td>
                  <Td className="whitespace-nowrap tabular text-ink-700">{formatDateRange(c.startDate, c.endDate)}</Td>
                  <Td className="text-ink-700">{[c.city, c.country].filter(Boolean).join(", ") || "—"}</Td>
                  <Td><StatusBadge status={effectiveStatus(c.status, c.startDate, c.endDate)} /></Td>
                  <Td className="text-right font-semibold tabular text-ink-900">{results}</Td>
                  <Td>
                    <RowActions>
                      <ViewOnSite href={`/competitions/${c.slug}`} />
                      {canWrite && <EditLink href={`${BASE}/${c.id}`} label={c.name} />}
                      {canDelete && <DeleteButton action={deleteCompetition} id={c.id} label={c.name} />}
                    </RowActions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </BulkScope>
      )}
      <Pagination base={BASE} p={p} page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
