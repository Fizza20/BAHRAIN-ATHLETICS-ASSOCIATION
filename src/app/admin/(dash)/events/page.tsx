import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { CalendarDays } from "lucide-react";
import { db, schema as s } from "@/db";
import { COMPETITION_STATUS, EVENT_TYPES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatDateRange } from "@/lib/utils";
import { effectiveStatus, STATUS_LABEL } from "@/lib/status";
import { bulkDeleteEvents, deleteEvent } from "@/lib/actions/events";
import { DemoBadge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Events" };
const BASE = "/admin/events";
const SORTS = ["title", "type", "date", "city"] as const;
const TYPE_LABEL: Record<string, string> = { participation: "Participation", championship: "Championship", "training-camp": "Training camp", meeting: "Meeting", national: "National", community: "Community" };

export default async function EventsPage({ searchParams }: PageProps<"/admin/events">) {
  const user = await requireUser("events");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "date", dir: "desc" });
  const canWrite = can(user.role, "events", "write");
  const canDelete = can(user.role, "events", "delete");

  const where: SQL[] = [];
  if (q) where.push(or(like(s.events.title, `%${q}%`), like(s.events.city, `%${q}%`), like(s.events.location, `%${q}%`))!);
  if (p.type && p.type in TYPE_LABEL) where.push(eq(s.events.type, p.type as "meeting"));
  if (p.status && (COMPETITION_STATUS as readonly string[]).includes(p.status)) where.push(eq(s.events.status, p.status as "upcoming"));
  if (p.source === "demo") where.push(eq(s.events.isDemo, true));
  if (p.source === "real") where.push(eq(s.events.isDemo, false));
  const w = where.length ? and(...where) : undefined;
  const col = { title: s.events.title, type: s.events.type, date: s.events.startAt, city: s.events.city }[sort];

  const [rows, [{ n: total }]] = await Promise.all([
    db
      .select({ e: s.events, competition: s.competitions.shortName })
      .from(s.events)
      .leftJoin(s.competitions, eq(s.events.competitionId, s.competitions.id))
      .where(w)
      .orderBy(dir === "asc" ? asc(col) : desc(col), asc(s.events.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(s.events).where(w),
  ]);
  const bulk = canDelete ? [{ label: "Delete", action: bulkDeleteEvents, confirm: "Delete {n} event(s) from the calendar?" }] : [];

  return (
    <div>
      <PageHeader
        eyebrow="Sports data"
        title="Events"
        description="The public calendar: competitions Bahrain attends, camps, national meets and community events."
        actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ New event</ButtonLink>}
      />
      <Toolbar
        base={BASE}
        q={q}
        placeholder="Search title, venue or city"
        keep={{ sort: p.sort, dir: p.dir }}
        filters={[
          { name: "type", label: "Type", options: EVENT_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] })), value: p.type },
          { name: "status", label: "Stored status", options: COMPETITION_STATUS.map((v) => ({ value: v, label: STATUS_LABEL[v] })), value: p.status },
          { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<CalendarDays className="size-5" aria-hidden />} title="No events found" description="Adjust the filters or add an event to the calendar." action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ New event</ButtonLink>} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.e.id)} /></Th>}
                <SortTh base={BASE} p={p} col="title" sort={sort} dir={dir}>Event</SortTh>
                <SortTh base={BASE} p={p} col="type" sort={sort} dir={dir}>Type</SortTh>
                <SortTh base={BASE} p={p} col="date" sort={sort} dir={dir}>Dates</SortTh>
                <SortTh base={BASE} p={p} col="city" sort={sort} dir={dir}>Location</SortTh>
                <Th>Status</Th>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, competition }) => (
                <tr key={e.id} className={trCls}>
                  {bulk.length > 0 && <Td><RowCheck id={e.id} label={e.title} /></Td>}
                  <Td>
                    <div className="flex items-center gap-2">
                      {canWrite ? <Link href={`${BASE}/${e.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{e.title}</Link> : <span className="font-semibold text-ink-950">{e.title}</span>}
                      {e.isDemo && <DemoBadge />}
                      <SourceLink href={e.sourceUrl} />
                    </div>
                    {competition && <p className="text-xs text-ink-500">Linked: {competition}</p>}
                  </Td>
                  <Td className="text-ink-700">{TYPE_LABEL[e.type]}</Td>
                  <Td className="whitespace-nowrap tabular text-ink-700">{formatDateRange(e.startAt, e.endAt)}</Td>
                  <Td className="text-ink-700">{[e.city, e.country].filter(Boolean).join(", ") || e.location || "—"}</Td>
                  <Td><StatusBadge status={effectiveStatus(e.status, e.startAt, e.endAt)} /></Td>
                  <Td>
                    <RowActions>
                      <ViewOnSite href={`/events/${e.slug}`} />
                      {canWrite && <EditLink href={`${BASE}/${e.id}`} label={e.title} />}
                      {canDelete && <DeleteButton action={deleteEvent} id={e.id} label={e.title} />}
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
