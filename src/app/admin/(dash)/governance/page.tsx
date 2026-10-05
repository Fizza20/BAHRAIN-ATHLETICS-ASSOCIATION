import type { Metadata } from "next";
import Link from "next/link";
import { asc, like, or } from "drizzle-orm";
import { Landmark } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { bulkDeleteBoardMembers, bulkDeleteCommittees, deleteBoardMember, deleteCommittee } from "@/lib/actions/governance";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { flat, hrefWith } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Governance" };
const BASE = "/admin/governance";
const GROUP: Record<string, string> = { executive: "Executive", committee: "Board", administration: "Administration" };

export default async function GovernancePage({ searchParams }: PageProps<"/admin/governance">) {
  const user = await requireUser("governance");
  const p = flat(await searchParams);
  const tab = p.tab === "committees" ? "committees" : "board";
  const q = (p.q ?? "").slice(0, 100);
  const canWrite = can(user.role, "governance", "write");
  const canDelete = can(user.role, "governance", "delete");

  const [board, committees] = await Promise.all([
    db.select().from(s.boardMembers).where(q ? or(like(s.boardMembers.name, `%${q}%`), like(s.boardMembers.title, `%${q}%`)) : undefined).orderBy(asc(s.boardMembers.sortOrder), asc(s.boardMembers.id)),
    db.select().from(s.committees).where(q ? or(like(s.committees.name, `%${q}%`), like(s.committees.chair, `%${q}%`)) : undefined).orderBy(asc(s.committees.sortOrder), asc(s.committees.id)),
  ]);

  const tabs = [
    { key: "board", label: "Board members", n: board.length },
    { key: "committees", label: "Committees", n: committees.length },
  ];
  const newHref = tab === "board" ? `${BASE}/board/new` : `${BASE}/committees/new`;

  return (
    <div>
      <PageHeader
        eyebrow="Federation"
        title="Governance"
        description="The board of directors and standing committees shown on the About pages. Order is controlled by the sort number."
        actions={canWrite && <ButtonLink href={newHref} arrow={false}>{tab === "board" ? "+ New board member" : "+ New committee"}</ButtonLink>}
      />
      <nav aria-label="Governance sections" className="-mt-2 mb-5 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={hrefWith(BASE, {}, { tab: t.key === "board" ? null : t.key })}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn("relative -mb-px flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold", tab === t.key ? "border-brand-600 text-ink-950" : "border-transparent text-ink-500 hover:text-ink-950")}
          >
            {t.label}
            <span className={cn("rounded-xs px-1.5 text-[0.6875rem] leading-5 tabular", tab === t.key ? "bg-ink-950 text-white" : "bg-ink-950/[0.06] text-ink-600")}>{t.n}</span>
          </Link>
        ))}
      </nav>
      <Toolbar base={BASE} q={q} placeholder={tab === "board" ? "Search name or title" : "Search committee or chair"} keep={{ tab: tab === "committees" ? "committees" : undefined }} />

      {tab === "board" ? (
        board.length === 0 ? (
          <EmptyState icon={<Landmark className="size-5" aria-hidden />} title="No board members" action={canWrite && <ButtonLink href={newHref} size="sm" arrow={false}>+ New board member</ButtonLink>} />
        ) : (
          <BulkScope actions={canDelete ? [{ label: "Delete", action: bulkDeleteBoardMembers, confirm: "Remove {n} board member(s) from the site?" }] : []}>
            <TableWrap>
              <thead>
                <tr>
                  {canDelete && <Th className="w-10"><SelectAll ids={board.map((b) => b.id)} /></Th>}
                  <Th className="w-16">Order</Th>
                  <Th>Name</Th>
                  <Th>Title</Th>
                  <Th>Group</Th>
                  <Th className="text-right"><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {board.map((b) => (
                  <tr key={b.id} className={trCls}>
                    {canDelete && <Td><RowCheck id={b.id} label={b.name} /></Td>}
                    <Td className="tabular text-ink-500">{String(b.sortOrder).padStart(2, "0")}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {canWrite ? <Link href={`${BASE}/board/${b.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{b.name}</Link> : <span className="font-semibold">{b.name}</span>}
                        {b.isDemo && <DemoBadge />}
                        <SourceLink href={b.sourceUrl} />
                      </div>
                    </Td>
                    <Td className="text-ink-700">{b.title}</Td>
                    <Td className="text-ink-700">{GROUP[b.group]}</Td>
                    <Td>
                      <RowActions>
                        <ViewOnSite href="/about/board" />
                        {canWrite && <EditLink href={`${BASE}/board/${b.id}`} label={b.name} />}
                        {canDelete && <DeleteButton action={deleteBoardMember} id={b.id} label={b.name} />}
                      </RowActions>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </BulkScope>
        )
      ) : committees.length === 0 ? (
        <EmptyState icon={<Landmark className="size-5" aria-hidden />} title="No committees" action={canWrite && <ButtonLink href={newHref} size="sm" arrow={false}>+ New committee</ButtonLink>} />
      ) : (
        <BulkScope actions={canDelete ? [{ label: "Delete", action: bulkDeleteCommittees, confirm: "Delete {n} committee(s)?" }] : []}>
          <TableWrap>
            <thead>
              <tr>
                {canDelete && <Th className="w-10"><SelectAll ids={committees.map((c) => c.id)} /></Th>}
                <Th className="w-16">Order</Th>
                <Th>Committee</Th>
                <Th>Chair</Th>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {committees.map((c) => (
                <tr key={c.id} className={trCls}>
                  {canDelete && <Td><RowCheck id={c.id} label={c.name} /></Td>}
                  <Td className="tabular text-ink-500">{String(c.sortOrder).padStart(2, "0")}</Td>
                  <Td className="max-w-lg">
                    <div className="flex items-center gap-2">
                      {canWrite ? <Link href={`${BASE}/committees/${c.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{c.name}</Link> : <span className="font-semibold">{c.name}</span>}
                      {c.isDemo && <DemoBadge />}
                      <SourceLink href={c.sourceUrl} />
                    </div>
                    {c.remit && <p className="truncate text-xs text-ink-500">{c.remit}</p>}
                  </Td>
                  <Td className="text-ink-700">{c.chair ?? "—"}</Td>
                  <Td>
                    <RowActions>
                      <ViewOnSite href="/about/governance" />
                      {canWrite && <EditLink href={`${BASE}/committees/${c.id}`} label={c.name} />}
                      {canDelete && <DeleteButton action={deleteCommittee} id={c.id} label={c.name} />}
                    </RowActions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </BulkScope>
      )}
    </div>
  );
}
