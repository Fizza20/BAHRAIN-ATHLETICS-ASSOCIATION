import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { Newspaper, Star } from "lucide-react";
import { db, schema as s } from "@/db";
import { CONTENT_STATUS, NEWS_CATEGORIES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { formatDate, NEWS_CATEGORY_LABEL } from "@/lib/utils";
import { bulkDeleteNews, bulkPublishNews, bulkUnpublishNews, deleteNews } from "@/lib/actions/news";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { hrefWith, listParams, Pagination, SortTh } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { ContentStatus, EditLink, EmptyState, PageHeader, RowActions, SourceLink, Td, Th, TableWrap, trCls, ViewOnSite } from "@/components/admin/ui";
import { AdminImg } from "@/components/admin/admin-img";
import { timeAgo } from "@/components/admin/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "News" };
const BASE = "/admin/news";
const SORTS = ["title", "status", "category", "published", "updated"] as const;
const STATUS_LABEL = { draft: "Draft", review: "In review", published: "Published" } as const;

export default async function NewsPage({ searchParams }: PageProps<"/admin/news">) {
  const user = await requireUser("news");
  const { p, q, sort, dir, page, pageSize, offset } = listParams(await searchParams, { sorts: SORTS, sort: "updated", dir: "desc" });
  const canWrite = can(user.role, "news", "write");
  const canPublish = can(user.role, "news", "publish");
  const canDelete = can(user.role, "news", "delete");

  const where: SQL[] = [];
  if (q) where.push(or(like(s.news.title, `%${q}%`), like(s.news.excerpt, `%${q}%`), like(s.news.author, `%${q}%`))!);
  if (p.status && (CONTENT_STATUS as readonly string[]).includes(p.status)) where.push(eq(s.news.status, p.status as "draft"));
  if (p.category && (NEWS_CATEGORIES as readonly string[]).includes(p.category)) where.push(eq(s.news.category, p.category as "athletes"));
  if (p.source === "demo") where.push(eq(s.news.isDemo, true));
  if (p.source === "real") where.push(eq(s.news.isDemo, false));
  const w = where.length ? and(...where) : undefined;
  const col = { title: s.news.title, status: s.news.status, category: s.news.category, published: s.news.publishedAt, updated: s.news.updatedAt }[sort];

  const [rows, [{ n: total }], statusCounts] = await Promise.all([
    db.select().from(s.news).where(w).orderBy(dir === "asc" ? sql`${col} asc nulls last` : sql`${col} desc nulls last`, desc(s.news.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(s.news).where(w),
    db.select({ status: s.news.status, n: count() }).from(s.news).groupBy(s.news.status),
  ]);
  const counts = Object.fromEntries(statusCounts.map((r) => [r.status, r.n])) as Record<string, number>;
  const all = statusCounts.reduce((a, r) => a + r.n, 0);

  const bulk = [
    ...(canPublish ? [{ label: "Publish", action: bulkPublishNews, tone: "default" as const }, { label: "Unpublish", action: bulkUnpublishNews, tone: "default" as const }] : []),
    ...(canDelete ? [{ label: "Delete", action: bulkDeleteNews, confirm: "Delete {n} stor(ies)? Published stories disappear from the site immediately." }] : []),
  ];

  const tabs: { key?: string; label: string; n: number }[] = [
    { label: "All", n: all },
    { key: "draft", label: "Drafts", n: counts.draft ?? 0 },
    { key: "review", label: "In review", n: counts.review ?? 0 },
    { key: "published", label: "Published", n: counts.published ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="News"
        description={canPublish ? "Write, review and publish federation news. Stories in review are waiting for you." : "Write drafts and submit them for review. A content manager publishes them."}
        actions={canWrite && <ButtonLink href={`${BASE}/new`} arrow={false}>+ Write story</ButtonLink>}
      />
      <nav aria-label="Status" className="relative -mt-2 mb-5 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
        {tabs.map((t) => {
          const active = (p.status ?? undefined) === t.key;
          return (
            <Link
              key={t.label}
              href={hrefWith(BASE, p, { status: t.key ?? null, page: null })}
              aria-current={active ? "page" : undefined}
              className={cn("relative -mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold", active ? "border-brand-600 text-ink-950" : "border-transparent text-ink-500 hover:text-ink-950")}
            >
              {t.label}
              <span className={cn("rounded-xs px-1.5 text-[0.6875rem] leading-5 tabular", active ? "bg-ink-950 text-white" : "bg-ink-950/[0.06] text-ink-600", t.key === "review" && t.n > 0 && !active && "bg-warning/15 text-warning")}>{t.n}</span>
            </Link>
          );
        })}
      </nav>
      <Toolbar
        base={BASE}
        q={q}
        placeholder="Search headline, excerpt or author"
        keep={{ sort: p.sort, dir: p.dir, status: p.status }}
        filters={[
          { name: "category", label: "Category", options: NEWS_CATEGORIES.map((c) => ({ value: c, label: NEWS_CATEGORY_LABEL[c] })), value: p.category },
          { name: "source", label: "Data", options: [{ value: "real", label: "Verified" }, { value: "demo", label: "Demo" }], value: p.source },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState icon={<Newspaper className="size-5" aria-hidden />} title={p.status ? `No ${STATUS_LABEL[p.status as keyof typeof STATUS_LABEL]?.toLowerCase() ?? ""} stories` : "No stories found"} description="Nothing matches these filters." action={canWrite && <ButtonLink href={`${BASE}/new`} size="sm" arrow={false}>+ Write story</ButtonLink>} />
      ) : (
        <BulkScope actions={bulk}>
          <TableWrap>
            <thead>
              <tr>
                {bulk.length > 0 && <Th className="w-10"><SelectAll ids={rows.map((r) => r.id)} /></Th>}
                <SortTh base={BASE} p={p} col="title" sort={sort} dir={dir}>Story</SortTh>
                <SortTh base={BASE} p={p} col="category" sort={sort} dir={dir}>Category</SortTh>
                <SortTh base={BASE} p={p} col="status" sort={sort} dir={dir}>Status</SortTh>
                <SortTh base={BASE} p={p} col="published" sort={sort} dir={dir}>Published</SortTh>
                <SortTh base={BASE} p={p} col="updated" sort={sort} dir={dir}>Updated</SortTh>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => {
                const editable = canWrite && (canPublish || n.status !== "published");
                return (
                  <tr key={n.id} className={trCls}>
                    {bulk.length > 0 && <Td><RowCheck id={n.id} label={n.title} /></Td>}
                    <Td className="max-w-[22rem]">
                      <div className="flex items-center gap-3">
                        <span className="block h-10 w-14 shrink-0 overflow-hidden rounded-xs bg-pearl">
                          {n.imageUrl && <AdminImg src={n.imageUrl} w={160} alt="" className="size-full object-cover" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {editable ? <Link href={`${BASE}/${n.id}`} className="truncate font-semibold text-ink-950 hover:text-brand-600">{n.title}</Link> : <span className="truncate font-semibold text-ink-950">{n.title}</span>}
                            {n.featured && <Star className="size-3.5 shrink-0 fill-gold text-gold" aria-label="Featured" />}
                            {n.isDemo && <DemoBadge />}
                            <SourceLink href={n.sourceUrl} />
                          </div>
                          <p className="truncate text-xs text-ink-500">{n.author ?? "—"}{n.excerpt ? ` · ${n.excerpt}` : ""}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-ink-700">{NEWS_CATEGORY_LABEL[n.category]}</Td>
                    <Td><ContentStatus status={n.status} /></Td>
                    <Td className="whitespace-nowrap tabular text-ink-700">{n.publishedAt ? formatDate(n.publishedAt) : "—"}</Td>
                    <Td className="whitespace-nowrap text-xs text-ink-500">{timeAgo(n.updatedAt)}</Td>
                    <Td>
                      <RowActions>
                        {n.status === "published" && <ViewOnSite href={`/news/${n.slug}`} />}
                        {editable && <EditLink href={`${BASE}/${n.id}`} label={n.title} />}
                        {canDelete && <DeleteButton action={deleteNews} id={n.id} label={n.title} />}
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
