import type { Metadata } from "next";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { History } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";
import { listParams, Pagination } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EmptyState, PageHeader, Td, Th, TableWrap, trCls } from "@/components/admin/ui";
import { ActionPill, dateTime, timeAgo } from "@/components/admin/format";

export const metadata: Metadata = { title: "Activity" };
const BASE = "/admin/activity";

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  await requireUser("activity");
  const { p, page, pageSize, offset } = listParams(await searchParams, { sorts: ["created"] as const, sort: "created", pageSize: 30 });
  const where: SQL[] = [];
  if (p.entity) where.push(eq(s.activityLog.entity, p.entity));
  if (p.action) where.push(eq(s.activityLog.action, p.action));
  if (p.user && /^\d+$/.test(p.user)) where.push(eq(s.activityLog.userId, Number(p.user)));
  const w = where.length ? and(...where) : undefined;
  const [rows, [{ n: total }], entities, actions, users] = await Promise.all([
    db
      .select({ a: s.activityLog, userName: s.users.name, role: s.users.role })
      .from(s.activityLog)
      .leftJoin(s.users, eq(s.activityLog.userId, s.users.id))
      .where(w)
      .orderBy(desc(s.activityLog.createdAt), desc(s.activityLog.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ n: count() }).from(s.activityLog).where(w),
    db.selectDistinct({ v: s.activityLog.entity }).from(s.activityLog).orderBy(s.activityLog.entity),
    db.selectDistinct({ v: s.activityLog.action }).from(s.activityLog).orderBy(s.activityLog.action),
    db.select({ id: s.users.id, name: s.users.name }).from(s.users).orderBy(s.users.name),
  ]);

  return (
    <div>
      <PageHeader eyebrow="System" title="Activity" description="An append-only audit trail of sign-ins and every change made in the control room." />
      <Toolbar
        base={BASE}
        searchable={false}
        filters={[
          { name: "entity", label: "Entity", options: entities.map((e) => ({ value: e.v, label: e.v[0].toUpperCase() + e.v.slice(1) })), value: p.entity },
          { name: "action", label: "Action", options: actions.map((e) => ({ value: e.v, label: e.v[0].toUpperCase() + e.v.slice(1) })), value: p.action },
          { name: "user", label: "User", options: users.map((u) => ({ value: String(u.id), label: u.name })), value: p.user },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<History className="size-5" aria-hidden />} title="No activity" description="Nothing has been logged for these filters." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th className="w-44">When</Th>
              <Th className="w-56">User</Th>
              <Th className="w-28">Action</Th>
              <Th className="w-32">Entity</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ a, userName, role }) => (
              <tr key={a.id} className={trCls}>
                <Td className="whitespace-nowrap">
                  <time dateTime={a.createdAt.toISOString()} title={dateTime(a.createdAt)} className="text-xs tabular text-ink-700">{dateTime(a.createdAt)}</time>
                  <span className="block text-[0.6875rem] text-ink-400">{timeAgo(a.createdAt)}</span>
                </Td>
                <Td>
                  <span className="font-semibold text-ink-950">{userName ?? "Deleted user"}</span>
                  {role && <span className="block text-xs text-ink-500">{ROLE_LABEL[role]}</span>}
                </Td>
                <Td><ActionPill action={a.action} /></Td>
                <Td className="capitalize text-ink-700">{a.entity}{a.entityId ? <span className="ml-1 font-mono text-[0.6875rem] text-ink-400">#{a.entityId}</span> : null}</Td>
                <Td className="text-ink-800">{a.label ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
      <Pagination base={BASE} p={p} page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
