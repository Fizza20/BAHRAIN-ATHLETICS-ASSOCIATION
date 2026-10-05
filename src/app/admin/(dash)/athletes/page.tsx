import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { PersonStanding, Star } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CATEGORY_LABEL } from "@/lib/utils";
import { disciplineOptions } from "@/lib/admin-queries";
import { bulkDeleteAthletes, bulkFeatureAthletes, deleteAthlete } from "@/lib/actions/athletes";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { Dot, EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";
import { AdminImg } from "@/components/admin/admin-img";
import { timeAgo } from "@/components/admin/format";

export const metadata: Metadata = { title: "Athletes" };
const BASE = "/admin/athletes";
const SORTS = ["name", "discipline", "category", "born", "updated"] as const;

export default async function AthletesPage({ searchParams }: PageProps<"/admin/athletes">) {
  const user = await requireUser("athletes");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "name" });
  const canWrite = can(user.role, "athletes", "write");
  const canDelete = can(user.role, "athletes", "delete");

  const where: SQL[] = [];
  if (q) {
    const t = `%${q}%`;
    where.push(or(like(s.athletes.firstName, t), like(s.athletes.lastName, t), like(sql`${s.athletes.firstName} || ' ' || ${s.athletes.lastName}`, t), like(s.athletes.nameAr, t), like(s.athletes.club, t))!);
  }
  if (p.discipline) where.push(eq(s.athletes.primaryDisciplineId, Number(p.discipline) || 0));
  if (p.gender === "men" || p.gender === "women") where.push(eq(s.athletes.gender, p.gender));
  if (p.category && p.category in CATEGORY_LABEL) where.push(eq(s.athletes.category, p.category as "senior"));
  if (p.status === "active" || p.status === "retired") where.push(eq(s.athletes.status, p.status));
  if (p.source === "demo") where.push(eq(s.athletes.isDemo, true));
  if (p.source === "real") where.push(eq(s.athletes.isDemo, false));
  const w = where.length ? and(...where) : undefined;

  const col = {
    name: [s.athletes.lastName, s.athletes.firstName],
    discipline: [s.disciplines.name],
    category: [s.athletes.category],
    born: [s.athletes.birthYear],
    updated: [s.athletes.updatedAt],
  }[sort];
  const order = col.map((c) => (dir === "asc" ? asc(c) : desc(c)));

  const [rows, [{ n: total }], disciplines] = await Promise.all([
    db
      .select({ a: s.athletes, discipline: s.disciplines.name })
      .from(s.athletes)
      .leftJoin(s.disciplines, eq(s.athletes.primaryDisciplineId, s.disciplines.id))
      .where(w)
      .orderBy(...order, asc(s.athletes.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(s.athletes).where(w),
    disciplineOptions(),
  ]);

  const bulk = [
    ...(canWrite ? [{ label: "Feature", action: bulkFeatureAthletes, tone: "default" as const }] : []),
    ...(canDelete ? [{ label: "Delete", action: bulkDeleteAthletes, confirm: "Delete {n} athlete(s)? Their results and news links are removed too." }] : []),
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Sports data"
        title="Athletes"
        description="Profiles for the national team and development squads. Changes appear on the public athlete pages immediately."
        actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ New athlete</ButtonLink>}
      />
      <Toolbar
        base={BASE}
        q={q}
        placeholder="Search name, Arabic name or club"
        keep={{ sort: p.sort, dir: p.dir }}
        filters={[
          { name: "discipline", label: "Discipline", options: disciplines, value: p.discipline },
          { name: "gender", label: "Gender", options: [{ value: "men", label: "Men" }, { value: "women", label: "Women" }], value: p.gender },
          { name: "category", label: "Category", options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })), value: p.category },
          { name: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "retired", label: "Retired" }], value: p.status },
          { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<PersonStanding className="size-5" aria-hidden />}
          title={q || Object.keys(p).length ? "No athletes match" : "No athletes yet"}
          description={q ? "Try a different name or clear the filters." : "Add the first athlete profile to start recording results."}
          action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ New athlete</ButtonLink>}
        />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && (
                  <Th className="w-10">
                    <SelectAll ids={rows.map((r) => r.a.id)} />
                  </Th>
                )}
                <SortTh base={BASE} p={p} col="name" sort={sort} dir={dir}>Athlete</SortTh>
                <SortTh base={BASE} p={p} col="discipline" sort={sort} dir={dir}>Discipline</SortTh>
                <SortTh base={BASE} p={p} col="category" sort={sort} dir={dir}>Category</SortTh>
                <SortTh base={BASE} p={p} col="born" sort={sort} dir={dir}>Born</SortTh>
                <Th>Status</Th>
                <SortTh base={BASE} p={p} col="updated" sort={sort} dir={dir}>Updated</SortTh>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, discipline }) => {
                const name = `${a.firstName} ${a.lastName}`;
                return (
                  <tr key={a.id} className={trCls}>
                    {bulk.length > 0 && (
                      <Td className="w-10">
                        <RowCheck id={a.id} label={name} />
                      </Td>
                    )}
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="relative block size-10 shrink-0 overflow-hidden rounded-xs bg-ink-950">
                          {a.imageUrl ? (
                            <AdminImg src={a.imageUrl} w={120} alt="" className="size-full object-cover" />
                          ) : (
                            <span className="flex size-full items-center justify-center text-xs font-bold text-white [font-variation-settings:'wdth'_80]">
                              {a.firstName[0]}
                              {a.lastName[0]}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {canWrite ? (
                              <Link href={`${BASE}/${a.id}`} className="truncate font-semibold text-ink-950 hover:text-brand-600">
                                {name}
                              </Link>
                            ) : (
                              <span className="truncate font-semibold text-ink-950">{name}</span>
                            )}
                            {a.featured && <Star className="size-3.5 shrink-0 fill-gold text-gold" aria-label="Featured" />}
                            {a.isDemo && <DemoBadge />}
                            <SourceLink href={a.sourceUrl} />
                          </div>
                          <p className="truncate text-xs text-ink-500">
                            {a.nameAr && (
                              <span lang="ar" dir="rtl" className="font-arabic">
                                {a.nameAr}
                              </span>
                            )}
                            {a.nameAr && a.club && " · "}
                            {a.club}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-ink-700">{discipline ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-ink-700">
                      {a.gender === "men" ? "Men" : "Women"} · {CATEGORY_LABEL[a.category]}
                    </Td>
                    <Td className="tabular text-ink-700">{a.birthYear ?? "—"}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700">
                        <Dot tone={a.status === "active" ? "success" : "neutral"} />
                        {a.status === "active" ? "Active" : "Retired"}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ink-500">{timeAgo(a.updatedAt)}</Td>
                    <Td>
                      <RowActions>
                        <ViewOnSite href={`/athletes/${a.slug}`} />
                        {canWrite && <EditLink href={`${BASE}/${a.id}`} label={name} />}
                        {canDelete && <DeleteButton action={deleteAthlete} id={a.id} label={name} />}
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
    </div>
  );
}
