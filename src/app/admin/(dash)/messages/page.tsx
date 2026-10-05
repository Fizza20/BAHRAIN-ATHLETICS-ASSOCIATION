import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { Inbox } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { bulkDeleteMessages, deleteMessage, markMessagesRead, markMessagesUnread } from "@/lib/actions/messages";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { hrefWith, listParams, Pagination } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EmptyState, PageHeader, RowActions, Td, Th, TableWrap, trCls } from "@/components/admin/ui";
import { timeAgo } from "@/components/admin/format";

export const metadata: Metadata = { title: "Messages" };
const BASE = "/admin/messages";

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const user = await requireUser("messages");
  const { p, q, page, pageSize, offset } = listParams(await searchParams, { sorts: ["created"] as const, sort: "created", pageSize: 20 });
  const canWrite = can(user.role, "messages", "write");
  const canDelete = can(user.role, "messages", "delete");
  const where: SQL[] = [];
  if (q) where.push(or(like(s.messages.firstName, `%${q}%`), like(s.messages.lastName, `%${q}%`), like(s.messages.email, `%${q}%`), like(s.messages.body, `%${q}%`))!);
  if (p.status === "unread") where.push(eq(s.messages.read, false));
  if (p.status === "read") where.push(eq(s.messages.read, true));
  if (p.topic) where.push(eq(s.messages.topic, p.topic));
  const w = where.length ? and(...where) : undefined;
  const [rows, [{ n: total }], topics, [{ n: unread }]] = await Promise.all([
    db.select().from(s.messages).where(w).orderBy(desc(s.messages.createdAt), desc(s.messages.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(s.messages).where(w),
    db.selectDistinct({ t: s.messages.topic }).from(s.messages),
    db.select({ n: count() }).from(s.messages).where(eq(s.messages.read, false)),
  ]);
  const bulk = [
    ...(canWrite ? [{ label: "Mark read", action: markMessagesRead, tone: "default" as const }, { label: "Mark unread", action: markMessagesUnread, tone: "default" as const }] : []),
    ...(canDelete ? [{ label: "Delete", action: bulkDeleteMessages, confirm: "Delete {n} message(s)? This can’t be undone." }] : []),
  ];

  return (
    <div>
      <PageHeader eyebrow="Federation" title="Messages" description={`Enquiries from the public contact form. ${unread} unread.`} />
      <nav aria-label="Inbox filter" className="-mt-2 mb-5 flex gap-1 border-b border-line">
        {[
          { key: undefined, label: "All" },
          { key: "unread", label: "Unread" },
          { key: "read", label: "Read" },
        ].map((t) => (
          <Link key={t.label} href={hrefWith(BASE, p, { status: t.key ?? null, page: null })} aria-current={p.status === t.key ? "page" : undefined} className={cn("-mb-px flex h-11 items-center border-b-2 px-3 text-sm font-semibold", p.status === t.key ? "border-brand-600 text-ink-950" : "border-transparent text-ink-500 hover:text-ink-950")}>
            {t.label}
            {t.key === "unread" && unread > 0 && <span className="ml-2 rounded-xs bg-brand-600 px-1.5 text-[0.6875rem] leading-5 text-white tabular">{unread}</span>}
          </Link>
        ))}
      </nav>
      <Toolbar base={BASE} q={q} placeholder="Search sender, email or message" keep={{ status: p.status }} filters={[{ name: "topic", label: "Topic", options: topics.map((t) => ({ value: t.t, label: t.t[0].toUpperCase() + t.t.slice(1) })), value: p.topic }]} />
      {rows.length === 0 ? (
        <EmptyState icon={<Inbox className="size-5" aria-hidden />} title={p.status === "unread" ? "Inbox zero" : "No messages"} description={p.status === "unread" ? "Every message has been read." : "Messages sent through the contact form appear here."} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.id)} /></Th>}
                <Th className="w-56">From</Th>
                <Th>Message</Th>
                <Th className="w-28">Topic</Th>
                <Th className="w-28">Received</Th>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className={cn(trCls, !m.read && "bg-brand-50/30")}>
                  {bulk.length > 0 && <Td><RowCheck id={m.id} label={`message from ${m.firstName} ${m.lastName}`} /></Td>}
                  <Td>
                    <Link href={`${BASE}/${m.id}`} className="flex items-center gap-2 hover:text-brand-600">
                      {!m.read && <span className="size-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
                      <span className={cn("truncate", m.read ? "text-ink-700" : "font-bold text-ink-950")}>{m.firstName} {m.lastName}</span>
                    </Link>
                    <p className="truncate text-xs text-ink-500">{m.email}</p>
                  </Td>
                  <Td className="max-w-md"><Link href={`${BASE}/${m.id}`} className={cn("line-clamp-1", m.read ? "text-ink-600" : "text-ink-900")}>{m.body}</Link></Td>
                  <Td><span className="rounded-xs bg-ink-950/[0.06] px-1.5 py-0.5 text-[0.6875rem] font-semibold capitalize text-ink-700">{m.topic}</span></Td>
                  <Td className="whitespace-nowrap text-xs text-ink-500">{timeAgo(m.createdAt)}</Td>
                  <Td><RowActions>{canDelete && <DeleteButton action={deleteMessage} id={m.id} label={`Message from ${m.firstName} ${m.lastName}`} />}</RowActions></Td>
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
