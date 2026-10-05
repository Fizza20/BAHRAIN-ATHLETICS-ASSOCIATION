import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { Medal, Star } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { bulkDeleteAchievements, deleteAchievement } from "@/lib/actions/achievements";
import { DemoBadge, MedalDot } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Achievements" };
const BASE = "/admin/achievements";
const SORTS = ["title", "year", "type"] as const;
const TYPES = { medal: "Medal", record: "Record", title: "Title", milestone: "Milestone" } as const;

export default async function AchievementsPage({ searchParams }: PageProps<"/admin/achievements">) {
  const user = await requireUser("achievements");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "year", dir: "desc" });
  const canWrite = can(user.role, "achievements", "write");
  const canDelete = can(user.role, "achievements", "delete");
  const where: SQL[] = [];
  if (q) where.push(or(like(s.achievements.title, `%${q}%`), like(s.achievements.description, `%${q}%`), like(s.athletes.lastName, `%${q}%`))!);
  if (p.type && p.type in TYPES) where.push(eq(s.achievements.type, p.type as "medal"));
  if (p.source === "demo") where.push(eq(s.achievements.isDemo, true));
  if (p.source === "real") where.push(eq(s.achievements.isDemo, false));
  const w = where.length ? and(...where) : undefined;
  const col = { title: s.achievements.title, year: s.achievements.year, type: s.achievements.type }[sort];
  const q0 = () => db.select({ a: s.achievements, firstName: s.athletes.firstName, lastName: s.athletes.lastName, competition: s.competitions.shortName }).from(s.achievements).leftJoin(s.athletes, eq(s.achievements.athleteId, s.athletes.id)).leftJoin(s.competitions, eq(s.achievements.competitionId, s.competitions.id));
  const [rows, [{ n: total }]] = await Promise.all([
    q0().where(w).orderBy(dir === "asc" ? asc(col) : desc(col), desc(s.achievements.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(s.achievements).leftJoin(s.athletes, eq(s.achievements.athleteId, s.athletes.id)).where(w),
  ]);
  const bulk = canDelete ? [{ label: "Delete", action: bulkDeleteAchievements, confirm: "Delete {n} achievement(s)?" }] : [];

  return (
    <div>
      <PageHeader eyebrow="Sports data" title="Achievements" description="Medals, records, titles and milestones in the federation’s honours roll." actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ New achievement</ButtonLink>} />
      <Toolbar base={BASE} q={q} placeholder="Search title or athlete" keep={{ sort: p.sort, dir: p.dir }} filters={[
        { name: "type", label: "Type", options: Object.entries(TYPES).map(([value, label]) => ({ value, label })), value: p.type },
        { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
      ]} />
      {rows.length === 0 ? (
        <EmptyState icon={<Medal className="size-5" aria-hidden />} title="No achievements found" action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ New achievement</ButtonLink>} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.a.id)} /></Th>}
                <SortTh base={BASE} p={p} col="title" sort={sort} dir={dir}>Achievement</SortTh>
                <SortTh base={BASE} p={p} col="type" sort={sort} dir={dir}>Type</SortTh>
                <Th>Athlete</Th>
                <Th>Competition</Th>
                <SortTh base={BASE} p={p} col="year" sort={sort} dir={dir}>Year</SortTh>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, firstName, lastName, competition }) => (
                <tr key={a.id} className={trCls}>
                  {bulk.length > 0 && <Td><RowCheck id={a.id} label={a.title} /></Td>}
                  <Td className="max-w-md">
                    <div className="flex items-center gap-2">
                      {canWrite ? <Link href={`${BASE}/${a.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{a.title}</Link> : <span className="font-semibold text-ink-950">{a.title}</span>}
                      {a.featured && <Star className="size-3.5 shrink-0 fill-gold text-gold" aria-label="Featured" />}
                      {a.isDemo && <DemoBadge />}
                      <SourceLink href={a.sourceUrl} />
                    </div>
                    {a.description && <p className="truncate text-xs text-ink-500">{a.description}</p>}
                  </Td>
                  <Td className="whitespace-nowrap">{a.medal ? <MedalDot medal={a.medal} /> : <span className="text-ink-700">{TYPES[a.type]}</span>}</Td>
                  <Td className="text-ink-700">{firstName ? `${firstName} ${lastName}` : "—"}</Td>
                  <Td className="text-ink-700">{competition ?? "—"}</Td>
                  <Td className="tabular text-ink-700">{a.year}</Td>
                  <Td>
                    <RowActions>
                      <ViewOnSite href="/achievements" />
                      {canWrite && <EditLink href={`${BASE}/${a.id}`} label={a.title} />}
                      {canDelete && <DeleteButton action={deleteAchievement} id={a.id} label={a.title} />}
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
