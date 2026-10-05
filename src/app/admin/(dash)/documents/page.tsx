import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, count, eq, like, or, sql, type SQL } from "drizzle-orm";
import { FileText } from "lucide-react";
import { db, schema as s } from "@/db";
import { DOCUMENT_CATEGORIES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { bulkDeleteDocuments, deleteDocument } from "@/lib/actions/documents";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Documents" };
const BASE = "/admin/documents";
const SORTS = ["title", "category", "published"] as const;
const CAT: Record<string, string> = { governance: "Governance", integrity: "Integrity", competition: "Competition", forms: "Forms", reports: "Reports" };

export default async function DocumentsPage({ searchParams }: PageProps<"/admin/documents">) {
  const user = await requireUser("documents");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "published", dir: "desc" });
  const canWrite = can(user.role, "documents", "write");
  const canDelete = can(user.role, "documents", "delete");
  const where: SQL[] = [];
  if (q) where.push(or(like(s.documents.title, `%${q}%`), like(s.documents.description, `%${q}%`))!);
  if (p.category && p.category in CAT) where.push(eq(s.documents.category, p.category as "forms"));
  if (p.source === "demo") where.push(eq(s.documents.isDemo, true));
  if (p.source === "real") where.push(eq(s.documents.isDemo, false));
  const w = where.length ? and(...where) : undefined;
  const col = { title: s.documents.title, category: s.documents.category, published: s.documents.publishedAt }[sort];
  const [rows, [{ n: total }]] = await Promise.all([
    db.select().from(s.documents).where(w).orderBy(dir === "asc" ? sql`${col} asc nulls last` : sql`${col} desc nulls last`, asc(s.documents.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(s.documents).where(w),
  ]);
  const bulk = canDelete ? [{ label: "Delete", action: bulkDeleteDocuments, confirm: "Delete {n} document(s) from the public library?" }] : [];
  return (
    <div>
      <PageHeader eyebrow="Federation" title="Documents" description="Statutes, policies, forms and reports in the public document library." actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ New document</ButtonLink>} />
      <Toolbar base={BASE} q={q} placeholder="Search title or description" keep={{ sort: p.sort, dir: p.dir }} filters={[
        { name: "category", label: "Category", options: DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: CAT[c] })), value: p.category },
        { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
      ]} />
      {rows.length === 0 ? (
        <EmptyState icon={<FileText className="size-5" aria-hidden />} title="No documents found" action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ New document</ButtonLink>} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.id)} /></Th>}
                <SortTh base={BASE} p={p} col="title" sort={sort} dir={dir}>Document</SortTh>
                <SortTh base={BASE} p={p} col="category" sort={sort} dir={dir}>Category</SortTh>
                <Th>Format</Th>
                <SortTh base={BASE} p={p} col="published" sort={sort} dir={dir}>Published</SortTh>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className={trCls}>
                  {bulk.length > 0 && <Td><RowCheck id={d.id} label={d.title} /></Td>}
                  <Td className="max-w-lg">
                    <div className="flex items-center gap-2">
                      {canWrite ? <Link href={`${BASE}/${d.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{d.title}</Link> : <span className="font-semibold text-ink-950">{d.title}</span>}
                      {d.isDemo && <DemoBadge />}
                      <SourceLink href={d.sourceUrl} />
                    </div>
                    {d.description && <p className="truncate text-xs text-ink-500">{d.description}</p>}
                  </Td>
                  <Td className="text-ink-700">{CAT[d.category]}</Td>
                  <Td><span className="rounded-xs bg-ink-950/[0.06] px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-700">{d.fileType ?? "—"}</span></Td>
                  <Td className="whitespace-nowrap tabular text-ink-700">{d.publishedAt ? formatDate(d.publishedAt) : "—"}</Td>
                  <Td>
                    <RowActions>
                      {d.url ? <ViewOnSite href={d.url} label="Open document" /> : <ViewOnSite href="/about/documents" />}
                      {canWrite && <EditLink href={`${BASE}/${d.id}`} label={d.title} />}
                      {canDelete && <DeleteButton action={deleteDocument} id={d.id} label={d.title} />}
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
